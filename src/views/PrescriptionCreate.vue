<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

/* =====================================================================
   MOCK DATA — replace with real API / Pinia store calls once wired up.
   Each block below is marked with the integration point it should hit.
===================================================================== */

// TODO: replace with GET /api/medicines (or a medicines Pinia store)
// `allergyGroup` is used for the basic allergy-warning check below —
// in a real integration this should come from the drug's actual allergen class.
const MEDICINE_DB = [
  { brand: 'Napa', generic: 'Paracetamol 500mg', dose: '1+1+1', instruction: 'খাবারের পর', duration: '৫ দিন', allergyGroup: null },
  { brand: 'Napa Extend', generic: 'Paracetamol 665mg', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৫ দিন', allergyGroup: null },
  { brand: 'Seclo', generic: 'Omeprazole 20mg', dose: '1+0+0', instruction: 'খালি পেটে', duration: '১৪ দিন', allergyGroup: null },
  { brand: 'Fexo', generic: 'Fexofenadine 120mg', dose: '0+0+1', instruction: 'খাবারের পর', duration: '৭ দিন', allergyGroup: null },
  { brand: 'Amodis', generic: 'Metronidazole 400mg', dose: '1+1+1', instruction: 'খাবারের পর', duration: '৫ দিন', allergyGroup: null },
  { brand: 'Ceevit', generic: 'Vitamin C 250mg', dose: '1+0+0', instruction: 'খাবারের পর', duration: '১০ দিন', allergyGroup: null },
  { brand: 'Monas', generic: 'Montelukast 10mg', dose: '0+0+1', instruction: 'ঘুমানোর আগে', duration: '১৪ দিন', allergyGroup: null },
  { brand: 'Ecosprin', generic: 'Aspirin 75mg', dose: '0+1+0', instruction: 'খাবারের পর', duration: 'চলমান', allergyGroup: 'NSAID' },
  { brand: 'Ace', generic: 'Aspirin 75mg', dose: '0+1+0', instruction: 'খাবারের পর', duration: 'চলমান', allergyGroup: 'NSAID' },
]

// TODO: replace with a real drug-interaction API (e.g. First Databank, RxNorm).
// This is a minimal illustrative stub — pairs listed either direction trigger a warning.
const INTERACTION_PAIRS = [
  ['Ecosprin', 'Ace'], // duplicate NSAID example
]

// TODO: replace with GET /api/patients?search= (match by regNo or mobile)
const PATIENT_DB = [
  {
    regNo: 'REG-1042', name: 'Kamal Hossain', age: '45', sex: 'Male', weight: '72', mobile: '01711000000',
    background: ['HTN', 'DM'],
    lastRx: {
      diagnoses: ['Type 2 DM, uncontrolled', 'Essential hypertension'],
      drugs: [
        { brand: 'Ecosprin', dose: '0+1+0', instruction: 'খাবারের পর', duration: 'চলমান' },
        { brand: 'Seclo', dose: '1+0+0', instruction: 'খালি পেটে', duration: '১৪ দিন' },
      ],
      advice: ['লবণ কম খাবেন', 'নিয়মিত হাঁটাচলা করবেন'],
    },
  },
]

// TODO: replace with GET /api/prescription-templates (doctor-scoped, saved templates)
const TEMPLATES = [
  {
    name: 'Common Cold – Adult',
    diagnoses: ['Acute viral rhinopharyngitis'],
    drugs: [
      { brand: 'Napa', dose: '1+1+1', instruction: 'খাবারের পর', duration: '৫ দিন' },
      { brand: 'Fexo', dose: '0+0+1', instruction: 'খাবারের পর', duration: '৫ দিন' },
    ],
    advice: ['প্রচুর পানি পান করবেন', 'বিশ্রাম নেবেন'],
  },
  {
    name: 'Gastritis',
    diagnoses: ['Acute gastritis'],
    drugs: [
      { brand: 'Seclo', dose: '1+0+0', instruction: 'খালি পেটে', duration: '১৪ দিন' },
    ],
    advice: ['মসলাযুক্ত খাবার এড়িয়ে চলবেন', 'সময়মতো খাবেন'],
  },
]

// TODO: replace with a real suggestion endpoint (or an AI call) keyed off dx text
const DIAGNOSIS_SUGGESTIONS = [
  { match: /fever|জ্বর/i, brands: ['Napa', 'Ceevit'] },
  { match: /gastritis|acidity/i, brands: ['Seclo'] },
  { match: /allergy|rhinitis/i, brands: ['Fexo', 'Monas'] },
  { match: /hypertension|htn/i, brands: ['Ecosprin'] },
]

const DOSE_CHIPS = ['1+0+1', '1+1+1', '0+0+1', '1+0+0', '0+1+0', '1+1+0']
const INSTRUCTION_CHIPS = ['খাবারের পর', 'খাবারের আগে', 'ঘুমানোর আগে', 'খালি পেটে']

const FOLLOWUP_DAYS = {
  '১ সপ্তাহ': 7,
  '২ সপ্তাহ': 14,
  '১ মাস': 30,
  '৫ মাস': 150,
}

/* ---------------- Tabs ---------------- */
const tabs = [
  { key: 'history', label: 'History', step: 1 },
  { key: 'exam', label: 'Exam', step: 2 },
  { key: 'dx', label: 'Dx', step: 3 },
  { key: 'rx', label: 'Rx', step: 4 },
  { key: 'advice', label: 'Advice', step: 5 },
  { key: 'report', label: 'Report', step: 6 },
]
const activeTab = ref('history')
const activeIndex = computed(() => tabs.findIndex(t => t.key === activeTab.value))
const isLastTab = computed(() => activeIndex.value === tabs.length - 1)
function goNextTab() {
  if (!isLastTab.value) activeTab.value = tabs[activeIndex.value + 1].key
}

/* ---------------- Form state ---------------- */
const patient = reactive({
  name: '', age: '', sex: '', regNo: '', weight: '', mobile: '',
  date: new Date().toISOString().slice(0, 10),
})
const matchedPatient = ref(null) // set when a PATIENT_DB record is selected

const backgroundOptions = ['HTN', 'DM', 'Asthma', 'COPD', 'IHD', 'CKD', 'CLD', 'CVD', 'Smoking', 'Leukaemia', 'Malignancy', 'Allergy']
const history = reactive({
  complaints: [{ text: '', duration: '' }],
  background: [],
})
function toggleBackground(item) {
  const i = history.background.indexOf(item)
  if (i === -1) history.background.push(item)
  else history.background.splice(i, 1)
}
function addComplaint() { history.complaints.push({ text: '', duration: '' }) }
function removeComplaint(i) { history.complaints.splice(i, 1) }

const vitals = reactive({
  bp: '', pulse: '', temp: '', spo2: '', rbs: '',
  heart: '', lungs: '', abdomen: '', anaemia: '', jaundice: '', cyanosis: '',
})

const dx = reactive({ diagnoses: [''] })
function addDiagnosis() { dx.diagnoses.push('') }
function removeDiagnosis(i) { dx.diagnoses.splice(i, 1) }

const rx = reactive({
  drugs: [{ brand: '', dose: '', instruction: '', duration: '' }],
})
function addDrug() { rx.drugs.push({ brand: '', dose: '', instruction: '', duration: '' }) }
function removeDrug(i) { rx.drugs.splice(i, 1) }
function duplicateDrug(i) {
  rx.drugs.splice(i + 1, 0, { ...rx.drugs[i] })
}

const advice = reactive({
  notes: [''],
  followUp: { interval: '১ সপ্তাহ', date: '', visitNo: '1', discount: '0', referredBy: '' },
})
function addAdvice() { advice.notes.push('') }
function removeAdvice(i) { advice.notes.splice(i, 1) }

const report = reactive({
  entries: [{ name: '', date: '', result: '', unit: '' }],
})
function addReport() { report.entries.push({ name: '', date: '', result: '', unit: '' }) }
function removeReport(i) { report.entries.splice(i, 1) }

/* =====================================================================
   1 & 2. Tab completion dots + Next button
===================================================================== */
const tabHasData = {
  history: () => history.complaints.some(c => c.text) || history.background.length > 0,
  exam: () => Object.values(vitals).some(v => v),
  dx: () => dx.diagnoses.some(d => d),
  rx: () => rx.drugs.some(d => d.brand),
  advice: () => advice.notes.some(a => a) || advice.followUp.date,
  report: () => report.entries.some(r => r.name),
}

/* =====================================================================
   3. Patient lookup (by Reg No. or Mobile) with autofill
===================================================================== */
const patientQuery = ref('')
const patientMatches = computed(() => {
  const q = patientQuery.value.trim().toLowerCase()
  if (!q) return []
  return PATIENT_DB.filter(p =>
    p.regNo.toLowerCase().includes(q) || p.mobile.includes(q) || p.name.toLowerCase().includes(q)
  )
})
function selectPatient(p) {
  patient.name = p.name
  patient.age = p.age
  patient.sex = p.sex
  patient.regNo = p.regNo
  patient.weight = p.weight
  patient.mobile = p.mobile
  history.background = [...p.background]
  matchedPatient.value = p
  patientQuery.value = ''
  ui.toast({ type: 'success', title: 'Patient loaded', message: `${p.name}'s profile applied.` })
}

/* =====================================================================
   4. Repeat last prescription
===================================================================== */
function repeatLastRx() {
  if (!matchedPatient.value?.lastRx) return
  const last = matchedPatient.value.lastRx
  dx.diagnoses = [...last.diagnoses]
  rx.drugs = last.drugs.map(d => ({ ...d }))
  advice.notes = [...last.advice]
  ui.toast({ type: 'success', title: 'Last prescription copied', message: 'Review and edit before saving.' })
}

/* =====================================================================
   5. Templates
===================================================================== */
const selectedTemplate = ref('')
function applyTemplate() {
  const tpl = TEMPLATES.find(t => t.name === selectedTemplate.value)
  if (!tpl) return
  dx.diagnoses = [...tpl.diagnoses]
  rx.drugs = tpl.drugs.map(d => ({ ...d }))
  advice.notes = [...tpl.advice]
  ui.toast({ type: 'success', title: 'Template applied', message: tpl.name })
}

/* =====================================================================
   6. Drug row: brand autocomplete + autofill + quick-pick chips
===================================================================== */
const openSuggestFor = ref(null) // index of row currently showing suggestions
const highlightedIndex = ref(-1) // keyboard-highlighted row within the open dropdown

// Matches on brand OR generic name now, so a doctor typing "paracetamol"
// finds "Napa" just as easily as typing the brand itself.
function brandMatches(text) {
  const q = (text || '').trim().toLowerCase()
  if (!q) return []
  return MEDICINE_DB.filter(m =>
    m.brand.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q)
  ).slice(0, 6)
}
function pickBrand(i, med) {
  rx.drugs[i].brand = med.brand
  if (!rx.drugs[i].dose) rx.drugs[i].dose = med.dose
  if (!rx.drugs[i].instruction) rx.drugs[i].instruction = med.instruction
  if (!rx.drugs[i].duration) rx.drugs[i].duration = med.duration
  openSuggestFor.value = null
  highlightedIndex.value = -1
}
function pickDoseChip(i, chip) { rx.drugs[i].dose = chip }
function pickInstructionChip(i, chip) { rx.drugs[i].instruction = chip }

/* ---- Keyboard navigation for the brand autocomplete ----
   ↓/↑ move the highlight, Enter picks the highlighted (or first) match,
   Escape closes the dropdown — so a doctor never has to reach for the mouse
   to add a drug they know by name. */
function onBrandKeydown(i, event) {
  const matches = brandMatches(rx.drugs[i].brand)
  if (!matches.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % matches.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightedIndex.value = (highlightedIndex.value - 1 + matches.length) % matches.length
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const chosen = matches[highlightedIndex.value] ?? matches[0]
    pickBrand(i, chosen)
  } else if (event.key === 'Escape') {
    openSuggestFor.value = null
    highlightedIndex.value = -1
  }
}

/* ---- Basic safety check: patient allergy flag + duplicate/known interaction pairs.
   TODO: replace with a real allergy/interaction service — this only demonstrates
   the pattern (warn, don't block) using the mock allergyGroup / INTERACTION_PAIRS data. */
const safetyWarnings = computed(() => {
  const warnings = []
  const brands = rx.drugs.map(d => d.brand).filter(Boolean)

  if (history.background.includes('Allergy')) {
    const nsaids = brands.filter(b => MEDICINE_DB.find(m => m.brand === b)?.allergyGroup === 'NSAID')
    if (nsaids.length) {
      warnings.push(`Patient has a noted allergy history — double-check ${nsaids.join(', ')} before prescribing.`)
    }
  }

  INTERACTION_PAIRS.forEach(([a, b]) => {
    if (brands.includes(a) && brands.includes(b)) {
      warnings.push(`${a} and ${b} are both on this prescription — check for duplication/interaction.`)
    }
  })

  return warnings
})

/* =====================================================================
   AI-suggested drugs based on entered diagnoses (simple keyword match here;
   swap for a real AI/API call — e.g. POST /api/suggest-drugs { diagnoses }).
===================================================================== */
const suggestedBrands = computed(() => {
  const text = dx.diagnoses.join(' ')
  const found = new Set()
  DIAGNOSIS_SUGGESTIONS.forEach(rule => {
    if (rule.match.test(text)) rule.brands.forEach(b => found.add(b))
  })
  return [...found]
    .map(b => MEDICINE_DB.find(m => m.brand === b))
    .filter(Boolean)
    .filter(m => !rx.drugs.some(d => d.brand === m.brand))
})
function addSuggested(med) {
  const emptyRow = rx.drugs.find(d => !d.brand)
  if (emptyRow) {
    emptyRow.brand = med.brand; emptyRow.dose = med.dose
    emptyRow.instruction = med.instruction; emptyRow.duration = med.duration
  } else {
    rx.drugs.push({ ...med })
  }
}

/* =====================================================================
   8. Follow-up date auto-calculated from visit date + interval
===================================================================== */
const followUpManuallyEdited = ref(false)
function recalcFollowUpDate() {
  if (followUpManuallyEdited.value) return
  const days = FOLLOWUP_DAYS[advice.followUp.interval]
  if (!days || !patient.date) return
  const base = new Date(patient.date)
  base.setDate(base.getDate() + days)
  advice.followUp.date = base.toISOString().slice(0, 10)
}
watch(() => advice.followUp.interval, recalcFollowUpDate)
watch(() => patient.date, recalcFollowUpDate)
function onFollowUpDateInput() { followUpManuallyEdited.value = true }
recalcFollowUpDate() // seed initial value

/* =====================================================================
   9. Draft autosave (localStorage) — swap for a Pinia "drafts" store if
   you want drafts to sync across devices instead of staying per-browser.
===================================================================== */
const DRAFT_KEY = 'careconnect_rx_draft_v1'
const showDraftBanner = ref(false)

function serializeDraft() {
  return JSON.stringify({ patient, history, vitals, dx, rx, advice, report, activeTab: activeTab.value })
}
function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, serializeDraft()) } catch (e) { /* storage full/unavailable — ignore */ }
}
// Debounced so typing doesn't trigger a localStorage write on every keystroke —
// waits until 600ms of inactivity, which keeps low-end tablets responsive.
let draftSaveTimer = null
function scheduleDraftSave() {
  clearTimeout(draftSaveTimer)
  draftSaveTimer = setTimeout(saveDraft, 600)
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch (e) { /* ignore */ }
}
function restoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return
  try {
    const d = JSON.parse(raw)
    Object.assign(patient, d.patient)
    Object.assign(history, d.history)
    Object.assign(vitals, d.vitals)
    Object.assign(dx, d.dx)
    Object.assign(rx, d.rx)
    Object.assign(advice, d.advice)
    Object.assign(report, d.report)
    activeTab.value = d.activeTab || 'history'
    followUpManuallyEdited.value = true // don't overwrite a restored date
  } catch (e) { /* corrupt draft — ignore */ }
  showDraftBanner.value = false
}
function dismissDraft() {
  clearDraft()
  showDraftBanner.value = false
}
onMounted(() => {
  if (localStorage.getItem(DRAFT_KEY)) showDraftBanner.value = true
})
watch(
  [patient, history, vitals, dx, rx, advice, report],
  () => scheduleDraftSave(),
  { deep: true }
)

/* ---------------- Submit ---------------- */
function goBack() {
  router.push({ name: 'prescriptions' })
}

function submitRx() {
  const id = `rx_${Date.now()}`
  const payload = {
    id,
    patient: patient.name,
    patientId: matchedPatient.value ? matchedPatient.value.regNo : 'usr_new',
    doctor: auth.user?.name,
    doctorId: auth.user?.id,
    issuedOn: patient.date,
    status: 'active',
    qrCode: `CC-RX-${id.toUpperCase()}`,
    vitals: { ...vitals },
    history: { complaints: history.complaints, background: history.background },
    diagnoses: dx.diagnoses.filter(Boolean),
    items: rx.drugs.filter(d => d.brand),
    advice: advice.notes.filter(Boolean),
    followUp: { ...advice.followUp },
    reports: report.entries.filter(r => r.name),
  }

  // TODO: replace with a real API call / Pinia store action once the backend
  // or a shared prescriptions store is wired up. For now this just confirms
  // creation and returns to the list.
  ui.toast({ type: 'success', title: 'Prescription created', message: `${id} issued to ${patient.name || 'patient'}.` })
  clearDraft()
  router.push({ name: 'prescriptions' })
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-5xl mx-auto">

      <!-- Draft restore banner -->
      <div v-if="showDraftBanner" class="mb-4 flex items-center justify-between gap-3 rounded-xl border border-pulse-200 bg-pulse-50 dark:bg-pulse-500/10 dark:border-pulse-500/30 px-4 py-3">
        <p class="text-sm text-meridian-700 dark:text-meridian-200">You have an unsaved prescription draft. Restore it?</p>
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" @click="dismissDraft" class="text-xs font-semibold text-meridian-400 hover:text-meridian-600 px-2 py-1">Discard</button>
          <button type="button" @click="restoreDraft" class="text-xs font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-lg px-3 py-1.5">Restore</button>
        </div>
      </div>

      <!-- Top bar -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">New prescription</h1>
          <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">Fill in each step, then save.</p>
        </div>
        <div class="flex items-center gap-3">
          <BaseButton variant="outline" @click="goBack">Cancel</BaseButton>
          <BaseButton @click="submitRx">Save &amp; Print</BaseButton>
        </div>
      </div>

      <!-- Patient identity -->
      <div class="rounded-2xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">

        <!-- 3. Patient search / lookup -->
        <div class="relative mb-5">
          <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Find patient (Reg No. / Mobile / Name)</label>
          <input v-model="patientQuery" type="text" placeholder="Search existing patient…"
            class="w-full border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5 text-sm outline-none focus:border-pulse-400" />
          <div v-if="patientMatches.length" class="absolute z-10 mt-1 w-full rounded-xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-meridian-900 shadow-lg overflow-hidden">
            <button v-for="p in patientMatches" :key="p.regNo" type="button" @click="selectPatient(p)"
              class="w-full text-left px-4 py-2.5 hover:bg-meridian-50 dark:hover:bg-white/5 flex items-center justify-between">
              <span class="text-sm font-semibold text-meridian-900 dark:text-white">{{ p.name }}</span>
              <span class="text-xs font-mono text-meridian-400">{{ p.regNo }} · {{ p.mobile }}</span>
            </button>
          </div>
          <button v-if="matchedPatient?.lastRx" type="button" @click="repeatLastRx"
            class="mt-2 text-xs font-semibold text-pulse-600 hover:underline">
            ↺ Repeat last prescription for {{ matchedPatient.name }}
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Name</label>
            <input v-model="patient.name" type="text" placeholder="রোগীর নাম"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Age</label>
            <input v-model="patient.age" type="text" placeholder="—"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Sex</label>
            <input v-model="patient.sex" type="text" placeholder="—"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Reg No.</label>
            <input v-model="patient.regNo" type="text" placeholder="—"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold font-mono text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Wt (kg)</label>
            <input v-model="patient.weight" type="text" placeholder="—"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Mobile</label>
            <input v-model="patient.mobile" type="text" placeholder="01XXXXXXXXX"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold font-mono text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
          <div>
            <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-meridian-400 mb-1.5">Date</label>
            <input v-model="patient.date" type="date"
              class="w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1 text-sm font-semibold font-mono text-meridian-900 dark:text-white focus:outline-none focus:border-pulse-500" />
          </div>
        </div>

        <!-- Tabs with completion dots -->
        <div class="flex gap-1.5 mt-6 -mb-px overflow-x-auto">
          <button
            v-for="tab in tabs" :key="tab.key"
            type="button"
            @click="activeTab = tab.key"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-white dark:bg-meridian-900 text-meridian-900 dark:text-white border border-meridian-100 dark:border-white/10 border-b-white dark:border-b-meridian-900'
                : 'text-meridian-400 hover:text-meridian-600'
            ]"
          >
            <span
              :class="[
                'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono font-semibold',
                tabHasData[tab.key]()
                  ? 'bg-emerald-500 text-white'
                  : activeTab === tab.key ? 'bg-pulse-500 text-white' : 'bg-meridian-100 text-meridian-500'
              ]"
            >{{ tabHasData[tab.key]() ? '✓' : tab.step }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="rounded-b-2xl border border-t-0 border-meridian-100 dark:border-white/10 bg-white dark:bg-meridian-900 p-7 shadow-sm">

        <!-- 1. History -->
        <div v-show="activeTab === 'history'">
          <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">History &amp; Complaints</h2>
          <p class="text-sm text-meridian-400 mt-1 mb-5">Chief complaints and background conditions</p>

          <div class="text-xs font-bold uppercase tracking-wide text-pulse-600 mb-3">C/C — প্রধান সমস্যা</div>
          <div v-for="(c, i) in history.complaints" :key="i" class="flex items-center gap-3 bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-4 py-3 mb-2.5">
            <input v-model="c.text" type="text" placeholder="যেমন — জ্বর, ৩ দিন যাবৎ" class="flex-1 bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
            <input v-model="c.duration" type="text" placeholder="duration" class="w-24 shrink-0 text-xs font-mono font-semibold text-pulse-600 bg-pulse-50 dark:bg-pulse-500/10 rounded-full px-3 py-1 outline-none text-center" />
            <button type="button" @click="removeComplaint(i)" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-pulse-50 hover:text-pulse-500 shrink-0">✕</button>
          </div>
          <button type="button" @click="addComplaint" class="w-full text-center py-3 border-1.5 border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold hover:bg-meridian-50">+ Add complaint</button>

          <div class="text-xs font-bold uppercase tracking-wide text-meridian-500 mt-7 mb-3">H/O — Background</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <label v-for="item in backgroundOptions" :key="item"
              :class="[
                'flex items-center gap-2.5 px-3.5 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-colors',
                history.background.includes(item)
                  ? 'border-pulse-400 bg-pulse-50 dark:bg-pulse-500/10 text-meridian-900 dark:text-white'
                  : 'border-meridian-100 dark:border-white/10 text-meridian-700 dark:text-meridian-300 hover:border-meridian-300'
              ]">
              <input type="checkbox" class="hidden" :checked="history.background.includes(item)" @change="toggleBackground(item)" />
              {{ item }}
            </label>
          </div>

          <button type="button" @click="goNextTab" class="mt-7 ml-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-xl px-5 py-2.5">
            Next: Exam →
          </button>
        </div>

        <!-- 2. Exam -->
        <div v-show="activeTab === 'exam'">
          <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Examination (O/E)</h2>
          <p class="text-sm text-meridian-400 mt-1 mb-5">Vitals and findings on examination</p>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div v-for="f in [
                {k:'bp', label:'BP', unit:'mmHg'}, {k:'pulse', label:'Pulse', unit:'b/m'},
                {k:'temp', label:'Temp', unit:'°F'}, {k:'spo2', label:'SpO2', unit:'%'},
                {k:'rbs', label:'RBS', unit:'mmol/L'}, {k:'heart', label:'Heart', unit:''},
                {k:'lungs', label:'Lungs', unit:''}, {k:'abdomen', label:'Abdomen', unit:''},
                {k:'anaemia', label:'Anaemia', unit:''}, {k:'jaundice', label:'Jaundice', unit:''},
                {k:'cyanosis', label:'Cyanosis', unit:''},
              ]" :key="f.k"
              class="border border-meridian-100 dark:border-white/10 rounded-xl p-3.5 hover:border-meridian-300 transition-colors">
              <label class="block text-[11.5px] font-semibold text-meridian-400 mb-1.5">{{ f.label }}</label>
              <div class="flex items-baseline justify-between gap-2">
                <input v-model="vitals[f.k]" type="text" placeholder="—" class="w-full bg-transparent outline-none font-mono text-base font-semibold text-meridian-900 dark:text-white" />
                <span v-if="f.unit" class="text-xs text-meridian-400 shrink-0">{{ f.unit }}</span>
              </div>
            </div>
          </div>

          <button type="button" @click="goNextTab" class="mt-7 ml-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-xl px-5 py-2.5">
            Next: Dx →
          </button>
        </div>

        <!-- 3. Dx -->
        <div v-show="activeTab === 'dx'">
          <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Diagnosis</h2>
          <p class="text-sm text-meridian-400 mt-1 mb-5">D/x — working or confirmed diagnoses</p>

          <div v-for="(d, i) in dx.diagnoses" :key="i" class="flex items-center gap-3.5 bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-4 py-3 mb-2.5">
            <span class="w-6 h-6 rounded-md bg-pulse-50 dark:bg-pulse-500/10 text-pulse-600 font-mono font-semibold text-xs flex items-center justify-center shrink-0">{{ i + 1 }}</span>
            <input v-model="dx.diagnoses[i]" type="text" placeholder="Diagnosis লিখুন" class="flex-1 bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
            <button type="button" @click="removeDiagnosis(i)" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-pulse-50 hover:text-pulse-500 shrink-0">✕</button>
          </div>
          <button type="button" @click="addDiagnosis" class="w-full text-center py-3 border-1.5 border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold hover:bg-meridian-50">+ Add diagnosis</button>

          <button type="button" @click="goNextTab" class="mt-7 ml-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-xl px-5 py-2.5">
            Next: Rx →
          </button>
        </div>

        <!-- 4. Rx -->
        <div v-show="activeTab === 'rx'">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Prescription</h2>
              <p class="text-sm text-meridian-400 mt-1">ওষুধ যোগ করুন — brand, dose, instruction, duration</p>
            </div>

            <!-- 5. Template picker -->
            <div class="flex items-center gap-2">
              <select v-model="selectedTemplate"
                class="text-xs font-semibold border border-meridian-100 dark:border-white/10 rounded-lg px-3 py-2 bg-meridian-50 dark:bg-white/5 outline-none">
                <option value="" disabled>Apply template…</option>
                <option v-for="t in TEMPLATES" :key="t.name" :value="t.name">{{ t.name }}</option>
              </select>
              <button type="button" @click="applyTemplate" :disabled="!selectedTemplate"
                class="text-xs font-semibold text-white bg-pulse-500 hover:bg-pulse-600 disabled:opacity-40 rounded-lg px-3 py-2">Apply</button>
            </div>
          </div>

          <!-- AI-suggested drugs based on entered diagnoses -->
          <div v-if="suggestedBrands.length" class="mt-4 flex flex-wrap items-center gap-2 bg-pulse-50 dark:bg-pulse-500/10 border border-pulse-200 dark:border-pulse-500/20 rounded-xl px-4 py-3">
            <span class="text-xs font-bold uppercase tracking-wide text-pulse-600 shrink-0">Suggested for this Dx:</span>
            <button v-for="m in suggestedBrands" :key="m.brand" type="button" @click="addSuggested(m)"
              class="text-xs font-semibold text-pulse-700 dark:text-pulse-300 bg-white dark:bg-white/10 border border-pulse-200 dark:border-pulse-500/30 rounded-full px-3 py-1 hover:bg-pulse-100">
              + {{ m.brand }}
            </button>
          </div>

          <!-- Safety warnings: allergy flag / known interaction pairs (illustrative — not a real drug safety engine) -->
          <div v-if="safetyWarnings.length" class="mt-4 space-y-2">
            <div v-for="(w, wi) in safetyWarnings" :key="wi"
              class="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3">
              <span class="text-amber-500 shrink-0">⚠</span>
              <span class="text-sm text-amber-800 dark:text-amber-300">{{ w }}</span>
            </div>
          </div>

          <div class="overflow-x-auto mt-5">
            <table class="w-full border-separate" style="border-spacing: 0 8px;">
              <thead>
                <tr class="text-[10.5px] uppercase tracking-wide text-meridian-400 font-bold">
                  <th class="text-left px-3.5 pb-1">No.</th>
                  <th class="text-left px-3.5 pb-1">Brand</th>
                  <th class="text-left px-3.5 pb-1">Dose</th>
                  <th class="text-left px-3.5 pb-1">Instruction</th>
                  <th class="text-left px-3.5 pb-1">Duration</th>
                  <th class="w-16"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in rx.drugs" :key="i" class="bg-meridian-50 dark:bg-white/5 align-top">
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 rounded-l-lg font-mono font-semibold text-pulse-600 text-sm">{{ i + 1 }}</td>

                  <!-- Brand: autocomplete -->
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 relative">
                    <input v-model="d.brand" type="text" placeholder="Brand or generic name"
                      @focus="openSuggestFor = i; highlightedIndex = -1"
                      @keydown="onBrandKeydown(i, $event)"
                      @blur="() => setTimeout(() => { if (openSuggestFor === i) { openSuggestFor = null; highlightedIndex = -1 } }, 150)"
                      class="w-full bg-transparent outline-none font-semibold text-sm text-meridian-900 dark:text-white" />
                    <div v-if="openSuggestFor === i && brandMatches(d.brand).length"
                      class="absolute z-10 mt-1 w-56 rounded-xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-meridian-900 shadow-lg overflow-hidden">
                      <button v-for="(m, mi) in brandMatches(d.brand)" :key="m.brand" type="button" @mousedown.prevent="pickBrand(i, m)"
                        :class="['w-full text-left px-3.5 py-2', mi === highlightedIndex ? 'bg-meridian-50 dark:bg-white/5' : 'hover:bg-meridian-50 dark:hover:bg-white/5']">
                        <div class="text-sm font-semibold text-meridian-900 dark:text-white">{{ m.brand }}</div>
                        <div class="text-[11px] text-meridian-400">{{ m.generic }}</div>
                      </button>
                      <div class="px-3.5 py-1.5 text-[10px] text-meridian-300 border-t border-meridian-100 dark:border-white/10">↑↓ to navigate · Enter to select</div>
                    </div>
                  </td>

                  <!-- Dose: free text + quick chips -->
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10">
                    <input v-model="d.dose" type="text" placeholder="1+0+1" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white mb-1.5" />
                    <div class="flex flex-wrap gap-1">
                      <button v-for="chip in DOSE_CHIPS" :key="chip" type="button" @click="pickDoseChip(i, chip)"
                        class="text-[10.5px] font-mono font-semibold text-meridian-500 bg-white dark:bg-white/10 border border-meridian-100 dark:border-white/10 rounded-full px-2 py-0.5 hover:border-pulse-400 hover:text-pulse-600">{{ chip }}</button>
                    </div>
                  </td>

                  <!-- Instruction: free text + quick chips -->
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10">
                    <input v-model="d.instruction" type="text" placeholder="খাবারের পর" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white mb-1.5" />
                    <div class="flex flex-wrap gap-1">
                      <button v-for="chip in INSTRUCTION_CHIPS" :key="chip" type="button" @click="pickInstructionChip(i, chip)"
                        class="text-[10.5px] font-semibold text-meridian-500 bg-white dark:bg-white/10 border border-meridian-100 dark:border-white/10 rounded-full px-2 py-0.5 hover:border-pulse-400 hover:text-pulse-600">{{ chip }}</button>
                    </div>
                  </td>

                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="d.duration" type="text" placeholder="৭ দিন" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>

                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 rounded-r-lg">
                    <div class="flex items-center gap-1">
                      <button type="button" @click="duplicateDrug(i)" title="Duplicate row" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-meridian-100 hover:text-meridian-700">⧉</button>
                      <button type="button" @click="removeDrug(i)" title="Remove row" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-pulse-50 hover:text-pulse-500">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button type="button" @click="addDrug" class="w-full text-center py-3 mt-2 border-1.5 border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold hover:bg-meridian-50">+ Add drug</button>

          <button type="button" @click="goNextTab" class="mt-7 ml-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-xl px-5 py-2.5">
            Next: Advice →
          </button>
        </div>

        <!-- 5. Advice -->
        <div v-show="activeTab === 'advice'">
          <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Advice &amp; Follow-up</h2>
          <p class="text-sm text-meridian-400 mt-1 mb-5">উপদেশ ও পরবর্তী সাক্ষাতের তথ্য</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-9">
            <div>
              <div class="text-xs font-bold uppercase tracking-wide text-pulse-600 mb-3.5">উপদেশ</div>
              <div v-for="(a, i) in advice.notes" :key="i" class="flex items-center gap-3 bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-4 py-3 mb-2.5">
                <input v-model="advice.notes[i]" type="text" placeholder="নতুন উপদেশ যোগ করুন" class="flex-1 bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                <button type="button" @click="removeAdvice(i)" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-pulse-50 hover:text-pulse-500 shrink-0">✕</button>
              </div>
              <button type="button" @click="addAdvice" class="w-full text-center py-3 border-1.5 border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold hover:bg-meridian-50">+ Add advice</button>
            </div>

            <div>
              <div class="text-xs font-bold uppercase tracking-wide text-meridian-500 mb-3.5">Follow-up</div>
              <div class="grid grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label class="block text-xs text-meridian-500 mb-1.5">পরবর্তী সাক্ষাৎ</label>
                  <div class="border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5">
                    <select v-model="advice.followUp.interval" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white appearance-none">
                      <option>১ সপ্তাহ</option>
                      <option>২ সপ্তাহ</option>
                      <option>১ মাস</option>
                      <option>৫ মাস</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-meridian-500 mb-1.5">তারিখ <span class="text-meridian-300">(auto — editable)</span></label>
                  <div class="border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5">
                    <input v-model="advice.followUp.date" @input="onFollowUpDateInput" type="date" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label class="block text-xs text-meridian-500 mb-1.5">ভিজিট নং</label>
                  <div class="border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5">
                    <input v-model="advice.followUp.visitNo" type="text" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-meridian-500 mb-1.5">ডিসকাউন্ট (৳)</label>
                  <div class="border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5">
                    <input v-model="advice.followUp.discount" type="text" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-xs text-meridian-500 mb-1.5">রেফার্ড বাই</label>
                <div class="border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5">
                  <input v-model="advice.followUp.referredBy" type="text" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <button type="button" @click="goNextTab" class="mt-7 ml-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-xl px-5 py-2.5">
            Next: Report →
          </button>
        </div>

        <!-- 6. Report -->
        <div v-show="activeTab === 'report'">
          <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Report Entry</h2>
          <p class="text-sm text-meridian-400 mt-1 mb-5">Lab / investigation results</p>

          <div class="overflow-x-auto">
            <table class="w-full border-separate" style="border-spacing: 0 8px;">
              <thead>
                <tr class="text-[10.5px] uppercase tracking-wide text-meridian-400 font-bold">
                  <th class="text-left px-3.5 pb-1">Report name</th>
                  <th class="text-left px-3.5 pb-1">Date</th>
                  <th class="text-left px-3.5 pb-1">Result / Value</th>
                  <th class="text-left px-3.5 pb-1">Unit</th>
                  <th class="w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in report.entries" :key="i" class="bg-meridian-50 dark:bg-white/5">
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 rounded-l-lg"><input v-model="r.name" type="text" placeholder="e.g. CBC" class="w-full bg-transparent outline-none font-semibold text-sm text-meridian-900 dark:text-white" /></td>
                  <!-- native date input instead of free-text dd-mm-yyyy -->
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="r.date" type="date" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="r.result" type="text" placeholder="Result" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="r.unit" type="text" placeholder="Unit" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 rounded-r-lg"><button type="button" @click="removeReport(i)" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-pulse-50 hover:text-pulse-500">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button type="button" @click="addReport" class="w-full text-center py-3 mt-2 border-1.5 border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold hover:bg-meridian-50">+ Add report</button>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>