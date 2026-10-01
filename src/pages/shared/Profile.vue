<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import {
  CameraIcon,
  CheckBadgeIcon,
  PlusIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()

const isDoctor = computed(() => auth.role === 'doctor')
const saving = ref(false)

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(?:\+?880|0)1[3-9]\d{8}$/ // BD mobile: 01XXXXXXXXX or +8801XXXXXXXXX

/* ---------------- Form Initialization ---------------- */
function buildForm(u = {}) {
  return {
    // Common fields
    name: u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    avatar: u.avatar || '',
    
    // Doctor fields
    specialty: u.specialty || '',
    designation: u.designation || '',
    license: u.license || '',
    experience: u.experience ?? '',
    degrees: u.degrees?.length 
      ? u.degrees.map((d) => ({ ...d })) 
      : [{ degree: '', institute: '' }],
    chambers: u.chambers?.length 
      ? u.chambers.map((c) => ({ ...c })) 
      : [{ name: '', address: '', phone: '' }],
    visitingDays: [...(u.visitingDays || [])],
    visitFrom: u.visitFrom || '',
    visitTo: u.visitTo || '',
    fee: u.fee ?? '',
    followUpFee: u.followUpFee ?? '',
    signature: u.signature || '',
    
    // Other role fields
    pharmacy: u.pharmacy || '',
    bloodType: u.bloodType || '',
    dob: u.dob || '',
  }
}

const form = reactive(buildForm(auth.user))
const errors = reactive({})
const snapshot = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== snapshot.value)

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k])
}

function resetForm() {
  Object.assign(form, buildForm(auth.user))
  snapshot.value = JSON.stringify(form)
  clearErrors()
}

// Sync form when auth user updates late (unless form is dirty)
watch(() => auth.user, () => { 
  if (!dirty.value) resetForm() 
})

// Warn before route change if unsaved changes exist
onBeforeRouteLeave(() => {
  if (dirty.value) return window.confirm('You have unsaved changes. Leave without saving?')
})

const licenseLocked = computed(() => !!auth.user?.licenseVerified)
/* ---------------- Saved data for the profile card ---------------- */
const savedDegrees = computed(() =>
  (auth.user?.degrees || []).filter((d) => d.degree?.trim())
)
const savedChambers = computed(() =>
  (auth.user?.chambers || []).filter((c) => c.name?.trim())
)

/* ---------------- Dynamic Degree & Chamber Handlers ---------------- */
function addDegree() {
  form.degrees.push({ degree: '', institute: '' })
}
function removeDegree(index) {
  if (form.degrees.length > 1) {
    form.degrees.splice(index, 1)
  } else {
    form.degrees[0] = { degree: '', institute: '' }
  }
}

function addChamber() {
  form.chambers.push({ name: '', address: '', phone: '' })
}
function removeChamber(index) {
  if (form.chambers.length > 1) {
    form.chambers.splice(index, 1)
  } else {
    form.chambers[0] = { name: '', address: '', phone: '' }
  }
}

function toggleDay(day) {
  const i = form.visitingDays.indexOf(day)
  if (i === -1) form.visitingDays.push(day)
  else form.visitingDays.splice(i, 1)
  form.visitingDays.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
}

/* ---------------- Image Handling ---------------- */
const avatarInput = ref(null)
const signatureInput = ref(null)

function readImage(file, maxKB) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'))
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file'))
    if (file.size > maxKB * 1024) {
      return reject(new Error(`Image must be under ${maxKB >= 1024 ? maxKB / 1024 + ' MB' : maxKB + ' KB'}`))
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.readAsDataURL(file)
  })
}

async function onPick(field, maxKB, event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    form[field] = await readImage(file, maxKB)
  } catch (e) {
    ui.toast({ type: 'error', title: 'Upload failed', message: e.message })
  }
}

/* ---------------- Completeness Logic (Doctor) ---------------- */
const rxHeaderChecks = computed(() => [
  { label: 'Full name', ok: !!form.name.trim() },
  { label: 'Degrees', ok: form.degrees.some((d) => d.degree.trim()) },
  { label: 'Specialty', ok: !!form.specialty.trim() },
  { label: 'BMDC reg. no.', ok: !!form.license.trim() },
  { label: 'At least 1 Chamber', ok: form.chambers.some((c) => c.name.trim()) },
  { label: 'Visiting hours', ok: form.visitingDays.length > 0 && !!form.visitFrom && !!form.visitTo },
  { label: 'Signature', ok: !!form.signature },
])

const completeness = computed(() => {
  const list = rxHeaderChecks.value
  return Math.round((list.filter((c) => c.ok).length / list.length) * 100)
})

const missingItems = computed(() => rxHeaderChecks.value.filter((c) => !c.ok).map((c) => c.label))

/* ---------------- Form Validation ---------------- */
const isWholeNumber = (v) => v === '' || v === null || /^\d+$/.test(String(v).trim())

function validate() {
  clearErrors()

  if (!form.name.trim()) errors.name = 'Full name is required'
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address'

  const phone = form.phone.replace(/[\s-]/g, '')
  if (isDoctor.value && !phone) errors.phone = 'Phone number is required'
  else if (phone && !PHONE_RE.test(phone)) errors.phone = 'Use a valid BD number, e.g. 01XXXXXXXXX'

  if (isDoctor.value) {
    if (!form.specialty.trim()) errors.specialty = 'Specialty is required'
    if (!form.degrees.some((d) => d.degree.trim())) errors.degrees = 'Add at least one qualification/degree'
    if (!form.license.trim()) errors.license = 'BMDC registration number is required'

    if (!isWholeNumber(form.experience) || Number(form.experience) > 70) errors.experience = 'Enter valid years (0–70)'
    if (!isWholeNumber(form.fee)) errors.fee = 'Enter a valid fee amount'
    if (!isWholeNumber(form.followUpFee)) errors.followUpFee = 'Enter a valid fee amount'

    const hasAnyVisiting = form.visitingDays.length || form.visitFrom || form.visitTo
    if (hasAnyVisiting) {
      if (!form.visitingDays.length) errors.visiting = 'Pick at least one visiting day'
      else if (!form.visitFrom || !form.visitTo) errors.visiting = 'Set both start and end time'
      else if (form.visitFrom >= form.visitTo) errors.visiting = 'End time must be after start time'
    }
  }

  if (auth.role === 'pharmacist' && !form.pharmacy.trim()) errors.pharmacy = 'Pharmacy name is required'

  return Object.keys(errors).length === 0
}

/* ---------------- Form Submission ---------------- */
const COMMON_FIELDS = ['name', 'email', 'phone', 'avatar']
const ROLE_FIELDS = {
  doctor: [
    'specialty', 'designation', 'license', 'experience', 
    'degrees', 'chambers', 'visitingDays', 'visitFrom', 
    'visitTo', 'fee', 'followUpFee', 'signature'
  ],
  pharmacist: ['pharmacy'],
  patient: ['dob', 'bloodType'],
  caretaker: ['dob'],
}
const NUMERIC_FIELDS = ['experience', 'fee', 'followUpFee']

function buildPayload() {
  const keys = [...COMMON_FIELDS, ...(ROLE_FIELDS[auth.role] || [])]
  const payload = {}
  
  keys.forEach((k) => {
    const v = form[k]
    if (Array.isArray(v)) {
      payload[k] = v.map((item) => (typeof item === 'object' ? { ...item } : item))
    } else if (NUMERIC_FIELDS.includes(k)) {
      payload[k] = v === '' || v === null ? null : Number(v)
    } else {
      payload[k] = typeof v === 'string' ? v.trim() : v
    }
  })
  
  payload.phone = payload.phone.replace(/[\s-]/g, '')
  if (licenseLocked.value) delete payload.license
  return payload
}

async function save() {
  if (saving.value || !dirty.value) return

  if (!validate()) {
    ui.toast({ type: 'error', title: 'Validation error', message: 'Please fix the highlighted fields.' })
    await nextTick()
    document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  saving.value = true
  try {
    const payload = buildPayload()

    if (typeof auth.updateProfile === 'function') {
      await auth.updateProfile(payload)
    } else {
      await new Promise((r) => setTimeout(r, 600))
      auth.user = { ...auth.user, ...payload }
    }

    snapshot.value = JSON.stringify(form)
    ui.toast({ type: 'success', title: 'Profile updated', message: 'Your profile has been saved successfully.' })
  } catch (e) {
    ui.toast({ type: 'error', title: 'Save failed', message: e?.message || 'Something went wrong.' })
  } finally {
    saving.value = false
  }
}

const controlClass = 'w-full rounded-lg border border-meridian-200 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-meridian-900 dark:text-white outline-none focus:border-meridian-500'
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-6">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT: Profile Identity Card & Stats -->
      <div class="space-y-6 h-fit">
        <div class="card-base p-6 flex flex-col items-center text-center">
  <div class="relative">
    <BaseAvatar :src="form.avatar || auth.user?.avatar" :name="auth.user?.name || ''" size="lg" />
    <button
      type="button"
      @click="avatarInput?.click()"
      class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-meridian-600 text-white ring-2 ring-white dark:ring-surface-darkcard btn-focus-ring"
      aria-label="Change avatar"
    >
      <CameraIcon class="h-3.5 w-3.5" />
    </button>
    <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onPick('avatar', 2048, $event)" />
  </div>

  <p class="mt-4 font-display text-lg font-semibold text-meridian-900 dark:text-white">{{ auth.user?.name }}</p>

  <!-- Doctor: designation & specialty -->
  <p v-if="isDoctor && auth.user?.designation" class="text-sm text-meridian-600 dark:text-meridian-300">
    {{ auth.user.designation }}
  </p>
  <p
    v-if="isDoctor && auth.user?.specialty"
    class="mt-1 text-xs font-semibold uppercase tracking-wider text-meridian-500"
  >
    {{ auth.user.specialty }}
  </p>

  <!-- Non-doctor: email under name (আগের মতোই) -->
  <p v-if="!isDoctor" class="text-sm text-meridian-500">{{ auth.user?.email }}</p>

  <div class="mt-3 flex items-center gap-2">
    <BaseBadge tone="success" class="capitalize">{{ auth.role?.replace('-', ' ') }}</BaseBadge>
    <span v-if="isDoctor && licenseLocked" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
      <CheckBadgeIcon class="h-4 w-4" /> Verified
    </span>
  </div>

  <!-- Doctor details -->
  <div
    v-if="isDoctor"
    class="mt-5 w-full space-y-5 border-t border-meridian-100 dark:border-white/10 pt-5 text-left"
  >
    <!-- Contact -->
    <ul class="space-y-2.5">
      <li v-if="auth.user?.email" class="flex items-center gap-2.5 text-sm text-meridian-700 dark:text-meridian-200">
        <EnvelopeIcon class="h-4 w-4 shrink-0 text-meridian-400" />
        <span class="min-w-0 break-all">{{ auth.user.email }}</span>
      </li>
      <li v-if="auth.user?.phone" class="flex items-center gap-2.5 text-sm text-meridian-700 dark:text-meridian-200">
        <PhoneIcon class="h-4 w-4 shrink-0 text-meridian-400" />
        <span>{{ auth.user.phone }}</span>
      </li>
    </ul>

    <!-- Degrees -->
    <div v-if="savedDegrees.length">
      <p class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-meridian-400">
        <AcademicCapIcon class="h-4 w-4" /> Qualifications
      </p>
      <ul class="space-y-2">
        <li
          v-for="(d, i) in savedDegrees"
          :key="i"
          class="border-l-2 border-meridian-200 dark:border-white/15 pl-3"
        >
          <p class="text-sm font-semibold text-meridian-900 dark:text-white">{{ d.degree }}</p>
          <p v-if="d.institute" class="text-xs text-meridian-500">{{ d.institute }}</p>
        </li>
      </ul>
    </div>

    <!-- Chambers -->
    <div v-if="savedChambers.length">
      <p class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-meridian-400">
        <BuildingOffice2Icon class="h-4 w-4" /> Chambers
      </p>
      <ul class="space-y-2">
        <li
          v-for="(c, i) in savedChambers"
          :key="i"
          class="rounded-lg bg-meridian-50 dark:bg-white/5 px-3 py-2"
        >
          <p class="text-sm font-semibold text-meridian-900 dark:text-white">{{ c.name }}</p>
          <p v-if="c.address" class="text-xs text-meridian-500">{{ c.address }}</p>
          <p v-if="c.phone" class="mt-0.5 text-xs font-medium text-meridian-600 dark:text-meridian-300">{{ c.phone }}</p>
        </li>
      </ul>
    </div>
  </div>
</div>

        <!-- Doctor Prescription Completeness Widget -->
        <div v-if="isDoctor" class="card-base p-5">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-semibold text-meridian-900 dark:text-white">Prescription Header</p>
            <span class="text-xs font-mono font-semibold text-meridian-500">{{ completeness }}%</span>
          </div>
          <div class="h-1.5 rounded-full bg-meridian-100 dark:bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-emerald-500 transition-all duration-300" :style="{ width: completeness + '%' }"></div>
          </div>
          <p v-if="missingItems.length" class="text-xs text-meridian-500 mt-3">
            Missing items: <span class="font-medium text-amber-600 dark:text-amber-400">{{ missingItems.join(', ') }}</span>
          </p>
          <p v-else class="text-xs text-emerald-600 mt-3">All required details for prescription header are ready!</p>
        </div>
      </div>

      <!-- RIGHT: Editable Form -->
      <form @submit.prevent="save" class="lg:col-span-2 card-base p-6 space-y-6" novalidate>
        
        <!-- Basic Info Section -->
        <section class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wide text-meridian-500">Basic Information</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <BaseInput v-model="form.name" label="Full name" />
              <p v-if="errors.name" data-field-error class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
            </div>
            <div>
              <BaseInput v-model="form.email" type="email" label="Email address" />
              <p v-if="errors.email" data-field-error class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
            </div>
            <div>
              <BaseInput v-model="form.phone" label="Phone number" placeholder="01XXXXXXXXX" />
              <p v-if="errors.phone" data-field-error class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
            </div>

            <!-- Role-Specific Basic Fields -->
            <div v-if="auth.role === 'pharmacist'">
              <BaseInput v-model="form.pharmacy" label="Pharmacy" />
              <p v-if="errors.pharmacy" data-field-error class="mt-1 text-xs text-red-500">{{ errors.pharmacy }}</p>
            </div>
            <BaseInput v-if="['patient', 'caretaker'].includes(auth.role)" v-model="form.dob" type="date" label="Date of birth" />
            <BaseInput v-if="auth.role === 'patient'" v-model="form.bloodType" label="Blood type" />
          </div>
        </section>

        <!-- Doctor Professional Details Section -->
        <section v-if="isDoctor" class="space-y-4 pt-2 border-t border-meridian-100 dark:border-white/10">
          <h2 class="text-xs font-bold uppercase tracking-wide text-meridian-500 pt-4">Professional Details</h2>
          
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <BaseInput v-model="form.specialty" label="Specialty" />
              <p v-if="errors.specialty" data-field-error class="mt-1 text-xs text-red-500">{{ errors.specialty }}</p>
            </div>
            <div>
              <BaseInput v-model="form.designation" label="Designation" placeholder="e.g. Senior Consultant" />
            </div>
            <div>
              <BaseInput v-model="form.license" label="BMDC Registration No." :disabled="licenseLocked" />
              <p v-if="licenseLocked" class="mt-1 text-xs text-meridian-400">Verified — contact admin to change.</p>
              <p v-if="errors.license" data-field-error class="mt-1 text-xs text-red-500">{{ errors.license }}</p>
            </div>
            <div>
              <BaseInput v-model="form.experience" label="Experience (Years)" />
              <p v-if="errors.experience" data-field-error class="mt-1 text-xs text-red-500">{{ errors.experience }}</p>
            </div>
          </div>

          <!-- Dynamic Degrees & Qualifications -->
          <div class="space-y-2 pt-2">
            <label class="block text-sm font-medium text-meridian-700 dark:text-meridian-200">Degrees & Qualifications</label>
            <p v-if="errors.degrees" data-field-error class="text-xs text-red-500 mb-2">{{ errors.degrees }}</p>
            
            <div class="space-y-2.5">
              <div
                v-for="(d, i) in form.degrees" :key="i"
                class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 items-center bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-3.5 py-2.5"
              >
                <input
                  v-model="d.degree" type="text" :aria-label="`Degree ${i + 1}`"
                  placeholder="Degree (e.g. MBBS, FCPS)"
                  class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <input
                  v-model="d.institute" type="text" :aria-label="`Institute ${i + 1}`"
                  placeholder="Institute (e.g. Dhaka Medical College)"
                  class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <button
                  type="button" @click="removeDegree(i)" :aria-label="`Remove degree ${i + 1}`"
                  class="w-7 h-7 flex items-center justify-center rounded-full shrink-0 text-meridian-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 justify-self-end sm:justify-self-auto"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              type="button" @click="addDegree"
              class="mt-2 w-full flex items-center justify-center gap-1.5 py-2 border-[1.5px] border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-meridian-600 dark:text-meridian-300 text-xs font-semibold hover:bg-meridian-50 dark:hover:bg-white/5 transition-colors"
            >
              <PlusIcon class="w-4 h-4" /> Add Degree
            </button>
          </div>
        </section>

        <!-- Doctor Chambers & Fees Section -->
        <section v-if="isDoctor" class="space-y-4 pt-2 border-t border-meridian-100 dark:border-white/10">
          <h2 class="text-xs font-bold uppercase tracking-wide text-meridian-500 pt-4">Chambers & Schedule</h2>

          <!-- Dynamic Chambers List -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-meridian-700 dark:text-meridian-200">Chambers / Hospitals</label>
            <div class="space-y-2.5">
              <div
                v-for="(c, i) in form.chambers" :key="i"
                class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2.5 items-center bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-3.5 py-2.5"
              >
                <input
                  v-model="c.name" type="text" :aria-label="`Chamber name ${i + 1}`"
                  placeholder="Hospital / Chamber Name"
                  class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <input
                  v-model="c.address" type="text" :aria-label="`Chamber address ${i + 1}`"
                  placeholder="Address"
                  class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <input
                  v-model="c.phone" type="text" :aria-label="`Hotline ${i + 1}`"
                  placeholder="Hotline Number"
                  class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <button
                  type="button" @click="removeChamber(i)" :aria-label="`Remove chamber ${i + 1}`"
                  class="w-7 h-7 flex items-center justify-center rounded-full shrink-0 text-meridian-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 justify-self-end sm:justify-self-auto"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button" @click="addChamber"
              class="mt-2 w-full flex items-center justify-center gap-1.5 py-2 border-[1.5px] border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-meridian-600 dark:text-meridian-300 text-xs font-semibold hover:bg-meridian-50 dark:hover:bg-white/5 transition-colors"
            >
              <PlusIcon class="w-4 h-4" /> Add Hospital / Chamber
            </button>
          </div>

          <!-- Visiting Hours -->
          <div>
            <label class="block text-sm font-medium text-meridian-700 dark:text-meridian-200 mb-2">Visiting Days & Hours</label>
            <div class="flex flex-wrap gap-2 mb-3">
              <button
                v-for="day in DAYS" :key="day" type="button" @click="toggleDay(day)"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  form.visitingDays.includes(day)
                    ? 'bg-meridian-600 border-meridian-600 text-white'
                    : 'border-meridian-200 dark:border-white/15 text-meridian-500 hover:border-meridian-400'
                ]"
              >{{ day }}</button>
            </div>
            <div class="flex items-center gap-3">
              <input v-model="form.visitFrom" type="time" :class="[controlClass, 'max-w-[140px]']" aria-label="Visiting start time" />
              <span class="text-sm text-meridian-400">to</span>
              <input v-model="form.visitTo" type="time" :class="[controlClass, 'max-w-[140px]']" aria-label="Visiting end time" />
            </div>
            <p v-if="errors.visiting" data-field-error class="mt-1 text-xs text-red-500">{{ errors.visiting }}</p>
          </div>

          <!-- Consultation Fees -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <BaseInput v-model="form.fee" label="Consultation Fee (৳)" />
              <p v-if="errors.fee" data-field-error class="mt-1 text-xs text-red-500">{{ errors.fee }}</p>
            </div>
            <div>
              <BaseInput v-model="form.followUpFee" label="Follow-up Fee (৳)" />
              <p v-if="errors.followUpFee" data-field-error class="mt-1 text-xs text-red-500">{{ errors.followUpFee }}</p>
            </div>
          </div>
        </section>

        <!-- Doctor Signature Section -->
        <section v-if="isDoctor" class="space-y-3 pt-2 border-t border-meridian-100 dark:border-white/10">
          <h2 class="text-xs font-bold uppercase tracking-wide text-meridian-500 pt-4">Signature / Seal</h2>
          <p class="text-xs text-meridian-400">Appears at the bottom of printed prescriptions. PNG or JPG under 500 KB.</p>

          <div v-if="form.signature" class="relative inline-block rounded-xl border border-meridian-100 dark:border-white/10 bg-white p-3">
            <img :src="form.signature" alt="Signature preview" class="max-h-20 w-auto" />
            <button 
              type="button" 
              @click="form.signature = ''" 
              aria-label="Remove signature"
              class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-meridian-600 text-white"
            >
              <XMarkIcon class="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <BaseButton type="button" variant="outline" @click="signatureInput?.click()">
              {{ form.signature ? 'Replace signature' : 'Upload signature' }}
            </BaseButton>
            <input ref="signatureInput" type="file" accept="image/png,image/jpeg" class="hidden" @change="onPick('signature', 500, $event)" />
          </div>
        </section>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-meridian-100 dark:border-white/10">
          <span v-if="dirty" class="text-xs text-amber-600 dark:text-amber-400 mr-auto font-medium">Unsaved changes</span>
          <BaseButton type="button" variant="outline" :disabled="!dirty || saving" @click="resetForm">Reset</BaseButton>
          <BaseButton type="submit" :loading="saving" :disabled="!dirty">Save Changes</BaseButton>
        </div>

      </form>
    </div>
  </DashboardLayout>
</template>