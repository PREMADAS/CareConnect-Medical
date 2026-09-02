<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

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

/* ---------------- Form state ---------------- */
const patient = reactive({
  name: '', age: '', sex: '', regNo: '', weight: '', mobile: '',
  date: new Date().toISOString().slice(0, 10),
})

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

/* ---------------- Submit ---------------- */
function goBack() {
  router.push({ name: 'prescriptions' })
}

function submitRx() {
  const id = `rx_${Date.now()}`
  const payload = {
    id,
    patient: patient.name,
    patientId: 'usr_new',
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
  router.push({ name: 'prescriptions' })
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-5xl mx-auto">

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

        <!-- Tabs -->
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
                activeTab === tab.key ? 'bg-pulse-500 text-white' : 'bg-meridian-100 text-meridian-500'
              ]"
            >{{ tab.step }}</span>
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
        </div>

        <!-- 4. Rx -->
        <div v-show="activeTab === 'rx'">
          <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Prescription</h2>
          <p class="text-sm text-meridian-400 mt-1 mb-5">ওষুধ যোগ করুন — brand, dose, instruction, duration</p>

          <div class="overflow-x-auto">
            <table class="w-full border-separate" style="border-spacing: 0 8px;">
              <thead>
                <tr class="text-[10.5px] uppercase tracking-wide text-meridian-400 font-bold">
                  <th class="text-left px-3.5 pb-1">No.</th>
                  <th class="text-left px-3.5 pb-1">Brand</th>
                  <th class="text-left px-3.5 pb-1">Dose</th>
                  <th class="text-left px-3.5 pb-1">Instruction</th>
                  <th class="text-left px-3.5 pb-1">Duration</th>
                  <th class="w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in rx.drugs" :key="i" class="bg-meridian-50 dark:bg-white/5">
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 rounded-l-lg font-mono font-semibold text-pulse-600 text-sm">{{ i + 1 }}</td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="d.brand" type="text" placeholder="Brand name" class="w-full bg-transparent outline-none font-semibold text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="d.dose" type="text" placeholder="1+0+1" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="d.instruction" type="text" placeholder="খাবারের পর" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="d.duration" type="text" placeholder="৭ দিন" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10 rounded-r-lg"><button type="button" @click="removeDrug(i)" class="w-6 h-6 flex items-center justify-center rounded-full text-meridian-400 hover:bg-pulse-50 hover:text-pulse-500">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button type="button" @click="addDrug" class="w-full text-center py-3 mt-2 border-1.5 border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold hover:bg-meridian-50">+ Add drug</button>
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
                  <label class="block text-xs text-meridian-500 mb-1.5">তারিখ</label>
                  <div class="border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5">
                    <input v-model="advice.followUp.date" type="date" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
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
                  <td class="px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10"><input v-model="r.date" type="text" placeholder="dd-mm-yyyy" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" /></td>
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