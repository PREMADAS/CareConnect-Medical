<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const showPreview = ref(false)

/* =====================================================================
   Icons — tiny inline SVGs (currentColor, so they inherit the theme)
===================================================================== */
const svgBase = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
}
const makeIcon = (...paths) => ({
  render: () => h('svg', svgBase, paths.map(d => h('path', { d }))),
})
const IconClose = makeIcon('M18 6 6 18', 'm6 6 12 12')
const IconPlus = makeIcon('M12 5v14', 'M5 12h14')
const IconArrowRight = makeIcon('M5 12h14', 'm12 5 7 7-7 7')
const IconCopy = makeIcon(
  'M8 8h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z',
  'M4 16V5a1 1 0 0 1 1-1h11'
)
const IconCheck = makeIcon('m5 12 5 5L20 7')
const IconWarning = makeIcon(
  'M12 9v4',
  'M12 17h.01',
  'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'
)
const IconRepeat = makeIcon('M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5')
const IconSearch = makeIcon('M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'm21 21-4.35-4.35')
const IconChevronDown = makeIcon('m6 9 6 6 6-6')

/* =====================================================================
   Shared style tokens (same palette as before — only structure changed)
===================================================================== */
const cls = {
  label: 'block text-xs font-medium text-meridian-400 mb-1.5',
  underlineInput:
    'w-full bg-transparent border-b border-meridian-200 dark:border-white/15 pb-1.5 text-sm font-semibold text-meridian-900 dark:text-white outline-none transition-colors placeholder:font-normal focus:border-pulse-500',
  row: 'bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-4 py-3 transition-colors focus-within:border-pulse-400',
  box: 'border border-meridian-100 dark:border-white/10 rounded-lg px-3.5 py-2.5 bg-meridian-50 dark:bg-white/5 transition-colors focus-within:border-pulse-400',
  addBtn:
    'w-full flex items-center justify-center gap-1.5 py-3 border-[1.5px] border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold transition-colors hover:bg-meridian-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400',
  removeBtn:
    'w-7 h-7 flex items-center justify-center rounded-full shrink-0 text-meridian-400 transition-colors hover:bg-pulse-50 hover:text-pulse-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400',
  primaryBtn:
    'inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-xl px-5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-meridian-900',
  smallPrimaryBtn:
    'text-xs font-semibold text-white bg-pulse-500 hover:bg-pulse-600 rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400',
  sectionTitle: 'text-sm font-semibold text-pulse-600 mb-3',
  sectionTitleMuted: 'text-sm font-semibold text-meridian-500 mb-3',
  panelHeader: 'mb-6 pb-5 border-b border-meridian-100 dark:border-white/10',
  panelTitle: 'font-display text-xl font-semibold tracking-tight text-meridian-900 dark:text-white',
  panelSub: 'text-sm text-meridian-400 mt-1',
  dropdown:
    'absolute z-10 top-full mt-1 rounded-xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-meridian-900 shadow-lg overflow-hidden',
  cell: 'px-3.5 py-3 border-t border-b border-meridian-100 dark:border-white/10',
  th: 'text-left px-3.5 pb-1 text-xs font-semibold text-meridian-400',
  plainInput: 'w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white',
  chipBase:
    'text-[11px] font-semibold bg-white dark:bg-white/10 border rounded-full px-2.5 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400',
  chipIdle:
    'text-meridian-500 border-meridian-100 dark:border-white/10 hover:border-pulse-400 hover:text-pulse-600',
  chipActive: 'text-pulse-600 border-pulse-400',
}

/* =====================================================================
   Data
===================================================================== */
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
  { brand: 'Napa Extra', generic: 'Paracetamol 500mg + Caffeine 65mg', dose: '1+1+1', instruction: 'খাবারের পর', duration: '৩ দিন', allergyGroup: null },
  { brand: 'Naprox', generic: 'Naproxen 500mg', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৭ দিন', allergyGroup: 'NSAID' },
  { brand: 'Motigut', generic: 'Domperidone 10mg', dose: '1+1+1', instruction: 'খাবারের আগে', duration: '৭ দিন', allergyGroup: null },
  { brand: 'Zimax', generic: 'Azithromycin 500mg', dose: '1+0+0', instruction: 'খালি পেটে', duration: '৩ দিন', allergyGroup: null },
  { brand: 'Cef-3', generic: 'Cefixime 200mg', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৭ দিন', allergyGroup: null },
  { brand: 'Calbo-D', generic: 'Calcium + Vitamin D3', dose: '1+0+0', instruction: 'খাবারের পর', duration: '৩০ দিন', allergyGroup: null },
  { brand: 'Laxose', generic: 'Lactulose syrup', dose: '0+0+1', instruction: 'ঘুমানোর আগে', duration: '৭ দিন', allergyGroup: null },
  { brand: 'ORS', generic: 'Oral Rehydration Salt', dose: '১ প্যাকেট', instruction: 'প্রতি পাতলা পায়খানার পর', duration: '৩ দিন', allergyGroup: null },
]

const INTERACTION_PAIRS = [
  ['Ecosprin', 'Ace'], // duplicate NSAID example
]

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
    {
    name: 'Fever – Viral (Adult)',
    diagnoses: ['Viral fever'],
    drugs: [
      { brand: 'Napa', dose: '1+1+1', instruction: 'খাবারের পর', duration: '৩ দিন' },
      { brand: 'ORS', dose: '১ প্যাকেট', instruction: 'সারাদিন অল্প অল্প করে', duration: '৩ দিন' },
      { brand: 'Ceevit', dose: '1+0+0', instruction: 'খাবারের পর', duration: '৫ দিন' },
    ],
    advice: [
      'প্রচুর পানি ও তরল খাবার খাবেন',
      'পর্যাপ্ত বিশ্রাম নেবেন',
      'জ্বর ৩ দিনের বেশি থাকলে অথবা র‍্যাশ, রক্তপাত, তীব্র পেটব্যথা বা বমি হলে দ্রুত যোগাযোগ করবেন',
      'চিকিৎসকের পরামর্শ ছাড়া ব্যথানাশক (NSAID) খাবেন না',
    ],
  },
  {
    name: 'Knee Pain – Osteoarthritis',
    diagnoses: ['Osteoarthritis of knee joint'],
    drugs: [
      { brand: 'Naprox', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৭ দিন' },
      { brand: 'Seclo', dose: '1+0+0', instruction: 'খালি পেটে', duration: '৭ দিন' },
      { brand: 'Calbo-D', dose: '1+0+0', instruction: 'খাবারের পর', duration: '৩০ দিন' },
    ],
    advice: [
      'হাঁটুতে গরম সেঁক দেবেন',
      'সিঁড়ি বেয়ে ওঠানামা ও উবু হয়ে বসা এড়িয়ে চলবেন',
      'ওজন নিয়ন্ত্রণে রাখবেন',
      'চিকিৎসকের পরামর্শ অনুযায়ী হাঁটুর ব্যায়াম করবেন',
    ],
  },
  {
    name: 'Low Back Pain',
    diagnoses: ['Low back pain (mechanical)'],
    drugs: [
      { brand: 'Naprox', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৭ দিন' },
      { brand: 'Seclo', dose: '1+0+0', instruction: 'খালি পেটে', duration: '৭ দিন' },
    ],
    advice: [
      'শক্ত বিছানায় ঘুমাবেন',
      'ভারী জিনিস তোলা এবং দীর্ঘক্ষণ একটানা বসে থাকা এড়িয়ে চলবেন',
      'ব্যথার স্থানে গরম সেঁক দেবেন',
      'পায়ে অবশভাব, ঝিনঝিন বা প্রস্রাব-পায়খানায় সমস্যা হলে দ্রুত যোগাযোগ করবেন',
    ],
  },
  {
    name: 'Headache (Tension type)',
    diagnoses: ['Tension-type headache'],
    drugs: [
      { brand: 'Napa Extra', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৩ দিন' },
    ],
    advice: [
      'পর্যাপ্ত ঘুমাবেন এবং প্রচুর পানি পান করবেন',
      'মোবাইল/কম্পিউটারের স্ক্রিনে দীর্ঘক্ষণ তাকিয়ে থাকা এড়িয়ে চলবেন',
      'মাথাব্যথা তীব্র হলে বা ঘন ঘন হলে আবার যোগাযোগ করবেন',
    ],
  },
  {
    name: 'Diarrhoea – Acute Watery',
    diagnoses: ['Acute watery diarrhoea'],
    drugs: [
      { brand: 'ORS', dose: '১ প্যাকেট', instruction: 'প্রতি পাতলা পায়খানার পর', duration: '৩ দিন' },
      { brand: 'Motigut', dose: '1+1+1', instruction: 'খাবারের আগে', duration: '৩ দিন' },
    ],
    advice: [
      'স্যালাইন ও প্রচুর তরল খাবার খাবেন',
      'ভাত ও নরম খাবার খাবেন, বাইরের খোলা খাবার এড়িয়ে চলবেন',
      'খাওয়ার আগে ও টয়লেটের পরে সাবান দিয়ে হাত ধোবেন',
      'রক্ত মিশ্রিত পায়খানা, তীব্র দুর্বলতা, প্রস্রাব কমে গেলে বা জ্বর হলে দ্রুত হাসপাতালে আসবেন',
    ],
  },
  {
    name: 'Dyspepsia / GERD',
    diagnoses: ['Dyspepsia / GERD'],
    drugs: [
      { brand: 'Seclo', dose: '1+0+0', instruction: 'খালি পেটে', duration: '১৪ দিন' },
      { brand: 'Motigut', dose: '1+1+1', instruction: 'খাবারের আগে', duration: '৭ দিন' },
    ],
    advice: [
      'ঘুমানোর অন্তত ২-৩ ঘণ্টা আগে রাতের খাবার খাবেন',
      'চা, কফি, ধূমপান এবং তেল-মসলাযুক্ত খাবার এড়িয়ে চলবেন',
      'একবারে বেশি না খেয়ে অল্প অল্প করে খাবেন',
    ],
  },
  {
    name: 'UTI (Urinary Tract Infection)',
    diagnoses: ['Urinary tract infection'],
    drugs: [
      { brand: 'Cef-3', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৭ দিন' },
      { brand: 'Napa', dose: '1+0+1', instruction: 'খাবারের পর', duration: '৩ দিন' },
    ],
    advice: [
      'প্রচুর পানি পান করবেন',
      'প্রস্রাব চেপে রাখবেন না',
      'প্রয়োজনে Urine R/E ও C/S পরীক্ষা করাবেন',
    ],
  },
  {
    name: 'Allergic Rhinitis',
    diagnoses: ['Allergic rhinitis'],
    drugs: [
      { brand: 'Fexo', dose: '0+0+1', instruction: 'খাবারের পর', duration: '১৪ দিন' },
      { brand: 'Monas', dose: '0+0+1', instruction: 'ঘুমানোর আগে', duration: '১৪ দিন' },
    ],
    advice: [
      'ধুলাবালি ও ঠান্ডা লাগা এড়িয়ে চলবেন',
      'বাইরে গেলে মাস্ক ব্যবহার করবেন',
      'ঠান্ডা পানীয় ও ঠান্ডা খাবার এড়িয়ে চলবেন',
    ],
  },
  {
    name: 'Sore Throat / Tonsillitis',
    diagnoses: ['Acute tonsillitis'],
    drugs: [
      { brand: 'Zimax', dose: '1+0+0', instruction: 'খালি পেটে', duration: '৩ দিন' },
      { brand: 'Napa', dose: '1+1+1', instruction: 'খাবারের পর', duration: '৩ দিন' },
    ],
    advice: [
      'কুসুম গরম পানিতে লবণ দিয়ে দিনে ৩-৪ বার গার্গল করবেন',
      'গরম তরল খাবার খাবেন, ঠান্ডা পানীয় ও আইসক্রিম এড়িয়ে চলবেন',
      'গিলতে খুব কষ্ট বা শ্বাসকষ্ট হলে দ্রুত যোগাযোগ করবেন',
    ],
  },
  {
    name: 'Constipation',
    diagnoses: ['Constipation'],
    drugs: [
      { brand: 'Laxose', dose: '0+0+1', instruction: 'ঘুমানোর আগে', duration: '৭ দিন' },
    ],
    advice: [
      'প্রচুর পানি পান করবেন',
      'শাকসবজি ও ফলমূলের মতো আঁশযুক্ত খাবার বেশি খাবেন',
      'প্রতিদিন নির্দিষ্ট সময়ে টয়লেটে যাওয়ার অভ্যাস করবেন এবং নিয়মিত হাঁটবেন',
    ],
  },
]

// TODO: replace with a real suggestion endpoint (or an AI call) keyed off dx text
const DIAGNOSIS_SUGGESTIONS = [
  { match: /fever|জ্বর/i, brands: ['Napa', 'Ceevit'] },
  { match: /gastritis|acidity/i, brands: ['Seclo'] },
  { match: /allergy|rhinitis/i, brands: ['Fexo', 'Monas'] },
  { match: /hypertension|htn/i, brands: ['Ecosprin'] },
  { match: /osteoarthritis|knee|হাঁটু|back pain|কোমর/i, brands: ['Naprox', 'Seclo'] },
  { match: /diarrh|gastroenteritis|ডায়রিয়া/i, brands: ['ORS', 'Motigut'] },
  { match: /dyspepsia|gerd/i, brands: ['Seclo', 'Motigut'] },
  { match: /\buti\b|urinary/i, brands: ['Cef-3'] },
  { match: /constipation|কোষ্ঠকাঠিন্য/i, brands: ['Laxose'] },
  { match: /headache|migraine|মাথাব্যথা/i, brands: ['Napa Extra'] },
  { match: /tonsillitis|pharyngitis/i, brands: ['Napa'] },
]

const DOSE_CHIPS = ['1+0+1', '1+1+1', '0+0+1', '1+0+0', '0+1+0', '1+1+0']
const INSTRUCTION_CHIPS = ['খাবারের পর', 'খাবারের আগে', 'ঘুমানোর আগে', 'খালি পেটে']

const FOLLOWUP_DAYS = {
  '১ সপ্তাহ': 7,
  '২ সপ্তাহ': 14,
  '১ মাস': 30,
  '৫ মাস': 150,
}

/* ---------------- Field configs (drive the repeated inputs) ---------------- */
const patientFields = [
  { key: 'name', label: 'Name', placeholder: 'রোগীর নাম', type: 'text', span: 'col-span-2' },
  { key: 'age', label: 'Age', placeholder: '—', type: 'text' },
  { key: 'sex', label: 'Sex', placeholder: '—', type: 'text' },
  { key: 'regNo', label: 'Reg No.', placeholder: '—', type: 'text', mono: true },
  { key: 'weight', label: 'Wt (kg)', placeholder: '—', type: 'text', inputmode: 'decimal' },
  { key: 'mobile', label: 'Mobile', placeholder: '01XXXXXXXXX', type: 'text', mono: true, inputmode: 'tel' },
  { key: 'date', label: 'Date', placeholder: '', type: 'date', mono: true },
]

const vitalFields = [
  { k: 'bp', label: 'BP', unit: 'mmHg' },
  { k: 'pulse', label: 'Pulse', unit: 'b/m' },
  { k: 'temp', label: 'Temp', unit: '°F' },
  { k: 'spo2', label: 'SpO2', unit: '%' },
  { k: 'rbs', label: 'RBS', unit: 'mmol/L' },
]
const findingFields = [
  { k: 'heart', label: 'Heart', unit: '' },
  { k: 'lungs', label: 'Lungs', unit: '' },
  { k: 'abdomen', label: 'Abdomen', unit: '' },
  { k: 'anaemia', label: 'Anaemia', unit: '' },
  { k: 'jaundice', label: 'Jaundice', unit: '' },
  { k: 'cyanosis', label: 'Cyanosis', unit: '' },
]

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
const nextTabLabel = computed(() => (isLastTab.value ? '' : tabs[activeIndex.value + 1].label))
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

const DRAFT_KEY = 'careconnect_rx_draft_v1'
const showDraftBanner = ref(false)

function serializeDraft() {
  return JSON.stringify({ patient, history, vitals, dx, rx, advice, report, activeTab: activeTab.value })
}
function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, serializeDraft()) } catch (e) { /* storage full/unavailable — ignore */ }
}

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
    followUpManuallyEdited.value = true
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

/* ---------------- Submit & Print ---------------- */
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

  ui.toast({ type: 'success', title: 'Prescription created', message: `${id} issued to ${patient.name || 'patient'}.` })
  clearDraft()

  // Open native print dialog
  nextTick(() => {
    window.print()
    router.push({ name: 'prescriptions' })
  })
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0 pb-10">

      <!-- Draft restore banner -->
      <div
        v-if="showDraftBanner"
        role="status"
        class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-pulse-200 bg-pulse-50 dark:bg-pulse-500/10 dark:border-pulse-500/30 px-4 py-3"
      >
        <p class="text-sm text-meridian-700 dark:text-meridian-200">You have an unsaved prescription draft. Restore it?</p>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button" @click="dismissDraft"
            class="text-xs font-semibold text-meridian-400 hover:text-meridian-600 px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400"
          >Discard</button>
          <button
            type="button" @click="restoreDraft"
            :class="cls.smallPrimaryBtn"
          >Restore draft</button>
        </div>
      </div>

      <!-- Top bar -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-meridian-900 dark:text-white">New prescription</h1>
          <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">Fill in each step, then save.</p>
        </div>
        <div class="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3">
          <BaseButton variant="outline" @click="goBack">Cancel</BaseButton>
          <BaseButton variant="outline" @click="showPreview = true">Preview</BaseButton>
          <BaseButton @click="submitRx">Save &amp; Print</BaseButton>
        </div>
      </div>

      <div class="shadow-sm rounded-2xl">

        <!-- Patient identity + tabs -->
        <section class="rounded-t-2xl border border-b-0 border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 px-4 pt-4 sm:px-6 sm:pt-6">

          <!-- Patient search / lookup -->
          <div class="mb-6">
            <label for="patient-search" :class="cls.label">Find patient</label>
            <div class="relative">
              <IconSearch class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-meridian-400 pointer-events-none" />
              <input
                id="patient-search"
                v-model="patientQuery"
                type="text"
                autocomplete="off"
                placeholder="Search by Reg No., mobile or name…"
                class="w-full border border-meridian-100 dark:border-white/10 rounded-lg pl-10 pr-3.5 py-2.5 bg-meridian-50 dark:bg-white/5 text-sm outline-none transition-colors focus:border-pulse-400"
              />
              <div v-if="patientMatches.length" :class="[cls.dropdown, 'w-full']">
                <button
                  v-for="p in patientMatches" :key="p.regNo" type="button" @click="selectPatient(p)"
                  class="w-full text-left px-4 py-2.5 hover:bg-meridian-50 dark:hover:bg-white/5 flex items-center justify-between gap-3 transition-colors"
                >
                  <span class="text-sm font-semibold text-meridian-900 dark:text-white">{{ p.name }}</span>
                  <span class="text-xs font-mono text-meridian-400">{{ p.regNo }} · {{ p.mobile }}</span>
                </button>
              </div>
              <div v-else-if="patientQuery.trim()" :class="[cls.dropdown, 'w-full px-4 py-3 text-sm text-meridian-400']">
                No matching patient found.
              </div>
            </div>
            <button
              v-if="matchedPatient?.lastRx" type="button" @click="repeatLastRx"
              class="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-pulse-600 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400"
            >
              <IconRepeat class="w-3.5 h-3.5" />
              Repeat last prescription for {{ matchedPatient.name }}
            </button>
          </div>

          <!-- Patient fields -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-5 gap-y-5">
            <div v-for="f in patientFields" :key="f.key" :class="f.span">
              <label :for="`patient-${f.key}`" :class="cls.label">{{ f.label }}</label>
              <input
                :id="`patient-${f.key}`"
                v-model="patient[f.key]"
                :type="f.type"
                :inputmode="f.inputmode"
                :placeholder="f.placeholder"
                autocomplete="off"
                :class="[cls.underlineInput, f.mono ? 'font-mono' : '']"
              />
            </div>
          </div>

          <!-- Tabs with completion indicators -->
          <div
            role="tablist" aria-label="Prescription sections"
            class="flex gap-1 mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-meridian-100 dark:border-white/10 overflow-x-auto"
          >
            <button
              v-for="tab in tabs" :key="tab.key"
              type="button" role="tab"
              :id="`tab-${tab.key}`"
              :aria-selected="activeTab === tab.key"
              :aria-controls="`panel-${tab.key}`"
              @click="activeTab = tab.key"
              :class="[
                'flex items-center gap-2 px-3.5 py-3.5 -mb-px text-sm font-semibold whitespace-nowrap border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pulse-400',
                activeTab === tab.key
                  ? 'border-pulse-500 text-meridian-900 dark:text-white'
                  : 'border-transparent text-meridian-400 hover:text-meridian-600'
              ]"
            >
              <span
                :class="[
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-semibold transition-colors',
                  tabHasData[tab.key]()
                    ? 'bg-emerald-500 text-white'
                    : activeTab === tab.key ? 'bg-pulse-500 text-white' : 'bg-meridian-100 text-meridian-500'
                ]"
              >
                <IconCheck v-if="tabHasData[tab.key]()" class="w-3 h-3" />
                <template v-else>{{ tab.step }}</template>
              </span>
              {{ tab.label }}
            </button>
          </div>
        </section>

        <!-- Content -->
        <section class="rounded-b-2xl border border-t-0 border-meridian-100 dark:border-white/10 bg-white dark:bg-meridian-900 p-4 sm:p-7">

          <!-- 1. History -->
          <div v-show="activeTab === 'history'" id="panel-history" role="tabpanel" aria-labelledby="tab-history">
            <header :class="cls.panelHeader">
              <h2 :class="cls.panelTitle">History &amp; Complaints</h2>
              <p :class="cls.panelSub">Chief complaints and background conditions</p>
            </header>

            <h3 :class="cls.sectionTitle">C/C — প্রধান সমস্যা</h3>
            <div class="space-y-2.5">
              <div
                v-for="(c, i) in history.complaints" :key="i"
                :class="[cls.row, 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3']"
              >
                <input
                  v-model="c.text" type="text" :aria-label="`Complaint ${i + 1}`"
                  placeholder="যেমন — জ্বর, ৩ দিন যাবৎ"
                  class="flex-1 w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <div class="flex items-center gap-3 shrink-0">
                  <input
                    v-model="c.duration" type="text" :aria-label="`Duration for complaint ${i + 1}`"
                    placeholder="duration"
                    class="w-24 shrink-0 text-xs font-mono font-semibold text-pulse-600 bg-pulse-50 dark:bg-pulse-500/10 rounded-full px-3 py-1 outline-none text-center focus:ring-1 focus:ring-pulse-400"
                  />
                  <button type="button" @click="removeComplaint(i)" :aria-label="`Remove complaint ${i + 1}`" :class="cls.removeBtn">
                    <IconClose class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button type="button" @click="addComplaint" :class="[cls.addBtn, 'mt-2.5']">
              <IconPlus class="w-4 h-4" /> Add complaint
            </button>

            <h3 :class="[cls.sectionTitleMuted, 'mt-8']">H/O — Background</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <label
                v-for="item in backgroundOptions" :key="item"
                :class="[
                  'flex items-center gap-2.5 px-3.5 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-pulse-400',
                  history.background.includes(item)
                    ? 'border-pulse-400 bg-pulse-50 dark:bg-pulse-500/10 text-meridian-900 dark:text-white'
                    : 'border-meridian-100 dark:border-white/10 text-meridian-700 dark:text-meridian-300 hover:border-meridian-300'
                ]"
              >
                <input type="checkbox" class="sr-only" :checked="history.background.includes(item)" @change="toggleBackground(item)" />
                <span
                  :class="[
                    'flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors',
                    history.background.includes(item)
                      ? 'bg-pulse-500 border-pulse-500 text-white'
                      : 'border-meridian-200 dark:border-white/15'
                  ]"
                  aria-hidden="true"
                >
                  <IconCheck v-if="history.background.includes(item)" class="w-3 h-3" />
                </span>
                {{ item }}
              </label>
            </div>
          </div>

          <!-- 2. Exam -->
          <div v-show="activeTab === 'exam'" id="panel-exam" role="tabpanel" aria-labelledby="tab-exam">
            <header :class="cls.panelHeader">
              <h2 :class="cls.panelTitle">Examination (O/E)</h2>
              <p :class="cls.panelSub">Vitals and findings on examination</p>
            </header>

            <h3 :class="cls.sectionTitleMuted">Vitals</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div
                v-for="f in vitalFields" :key="f.k"
                class="border border-meridian-100 dark:border-white/10 rounded-xl p-3.5 transition-colors hover:border-meridian-300 focus-within:border-pulse-400"
              >
                <label :for="`vital-${f.k}`" :class="cls.label">{{ f.label }}</label>
                <div class="flex items-baseline justify-between gap-2">
                  <input
                    :id="`vital-${f.k}`" v-model="vitals[f.k]" type="text" placeholder="—" autocomplete="off"
                    class="w-full bg-transparent outline-none font-mono text-base font-semibold text-meridian-900 dark:text-white"
                  />
                  <span v-if="f.unit" class="text-xs text-meridian-400 shrink-0">{{ f.unit }}</span>
                </div>
              </div>
            </div>

            <h3 :class="[cls.sectionTitleMuted, 'mt-8']">Findings</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div
                v-for="f in findingFields" :key="f.k"
                class="border border-meridian-100 dark:border-white/10 rounded-xl p-3.5 transition-colors hover:border-meridian-300 focus-within:border-pulse-400"
              >
                <label :for="`vital-${f.k}`" :class="cls.label">{{ f.label }}</label>
                <input
                  :id="`vital-${f.k}`" v-model="vitals[f.k]" type="text" placeholder="—" autocomplete="off"
                  class="w-full bg-transparent outline-none font-mono text-base font-semibold text-meridian-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- 3. Dx -->
          <div v-show="activeTab === 'dx'" id="panel-dx" role="tabpanel" aria-labelledby="tab-dx">
            <header :class="cls.panelHeader">
              <h2 :class="cls.panelTitle">Diagnosis</h2>
              <p :class="cls.panelSub">D/x — working or confirmed diagnoses</p>
            </header>

            <div class="space-y-2.5">
              <div v-for="(d, i) in dx.diagnoses" :key="i" :class="[cls.row, 'flex items-center gap-3.5']">
                <span class="w-6 h-6 rounded-md bg-pulse-50 dark:bg-pulse-500/10 text-pulse-600 font-mono font-semibold text-xs flex items-center justify-center shrink-0">{{ i + 1 }}</span>
                <input
                  v-model="dx.diagnoses[i]" type="text" :aria-label="`Diagnosis ${i + 1}`"
                  placeholder="Diagnosis লিখুন"
                  class="flex-1 bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                />
                <button type="button" @click="removeDiagnosis(i)" :aria-label="`Remove diagnosis ${i + 1}`" :class="cls.removeBtn">
                  <IconClose class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <button type="button" @click="addDiagnosis" :class="[cls.addBtn, 'mt-2.5']">
              <IconPlus class="w-4 h-4" /> Add diagnosis
            </button>
          </div>

          <!-- 4. Rx -->
          <div v-show="activeTab === 'rx'" id="panel-rx" role="tabpanel" aria-labelledby="tab-rx">
            <header :class="[cls.panelHeader, 'flex items-center justify-between flex-wrap gap-3']">
              <div>
                <h2 :class="cls.panelTitle">Prescription</h2>
                <p :class="cls.panelSub">ওষুধ যোগ করুন — brand, dose, instruction, duration</p>
              </div>

              <!-- Template picker -->
              <div class="flex items-center gap-2">
                <select
                  v-model="selectedTemplate" aria-label="Prescription template"
                  class="text-xs font-semibold border border-meridian-100 dark:border-white/10 rounded-lg px-3 py-2 bg-meridian-50 dark:bg-white/5 outline-none transition-colors focus:border-pulse-400"
                >
                  <option value="" disabled>Apply template…</option>
                  <option v-for="t in TEMPLATES" :key="t.name" :value="t.name">{{ t.name }}</option>
                </select>
                <button
                  type="button" @click="applyTemplate" :disabled="!selectedTemplate"
                  :class="[cls.smallPrimaryBtn, 'disabled:opacity-40 disabled:cursor-not-allowed']"
                >Apply</button>
              </div>
            </header>

            <!-- Suggested drugs based on entered diagnoses -->
            <div
              v-if="suggestedBrands.length"
              class="mb-4 flex flex-wrap items-center gap-2 bg-pulse-50 dark:bg-pulse-500/10 border border-pulse-200 dark:border-pulse-500/20 rounded-xl px-4 py-3"
            >
              <span class="text-xs font-semibold text-pulse-600 shrink-0 mr-1">Suggested for this Dx</span>
              <button
                v-for="m in suggestedBrands" :key="m.brand" type="button" @click="addSuggested(m)"
                class="inline-flex items-center gap-1 text-xs font-semibold text-pulse-700 dark:text-pulse-300 bg-white dark:bg-white/10 border border-pulse-200 dark:border-pulse-500/30 rounded-full pl-2.5 pr-3 py-1 transition-colors hover:bg-pulse-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400"
              >
                <IconPlus class="w-3 h-3" /> {{ m.brand }}
              </button>
            </div>

            <!-- Safety warnings -->
            <div v-if="safetyWarnings.length" class="mb-4 space-y-2" role="alert">
              <div
                v-for="(w, wi) in safetyWarnings" :key="wi"
                class="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3"
              >
                <IconWarning class="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                <span class="text-sm text-amber-800 dark:text-amber-300">{{ w }}</span>
              </div>
            </div>

            <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table class="w-full min-w-[720px] border-separate" style="border-spacing: 0 8px;">
                <thead>
                  <tr>
                    <th scope="col" :class="[cls.th, 'w-12']">No.</th>
                    <th scope="col" :class="cls.th">Brand</th>
                    <th scope="col" :class="cls.th">Dose</th>
                    <th scope="col" :class="cls.th">Instruction</th>
                    <th scope="col" :class="cls.th">Duration</th>
                    <th scope="col" class="w-20"><span class="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, i) in rx.drugs" :key="i" class="bg-meridian-50 dark:bg-white/5 align-top">
                    <td :class="[cls.cell, 'rounded-l-lg font-mono font-semibold text-pulse-600 text-sm']">{{ i + 1 }}</td>

                    <!-- Brand: autocomplete -->
                    <td :class="[cls.cell, 'relative']">
                      <input
                        v-model="d.brand" type="text" placeholder="Brand or generic name"
                        role="combobox" aria-autocomplete="list" autocomplete="off"
                        :aria-expanded="openSuggestFor === i && brandMatches(d.brand).length > 0"
                        :aria-label="`Brand for drug ${i + 1}`"
                        @focus="openSuggestFor = i; highlightedIndex = -1"
                        @keydown="onBrandKeydown(i, $event)"
                        @blur="() => setTimeout(() => { if (openSuggestFor === i) { openSuggestFor = null; highlightedIndex = -1 } }, 150)"
                        class="w-full bg-transparent outline-none font-semibold text-sm text-meridian-900 dark:text-white"
                      />
                      <div
                        v-if="openSuggestFor === i && brandMatches(d.brand).length"
                        role="listbox"
                        :class="[cls.dropdown, 'w-60']"
                      >
                        <button
                          v-for="(m, mi) in brandMatches(d.brand)" :key="m.brand" type="button"
                          role="option" :aria-selected="mi === highlightedIndex"
                          @mousedown.prevent="pickBrand(i, m)"
                          :class="['w-full text-left px-3.5 py-2 transition-colors', mi === highlightedIndex ? 'bg-meridian-50 dark:bg-white/5' : 'hover:bg-meridian-50 dark:hover:bg-white/5']"
                        >
                          <div class="text-sm font-semibold text-meridian-900 dark:text-white">{{ m.brand }}</div>
                          <div class="text-[11px] text-meridian-400">{{ m.generic }}</div>
                        </button>
                        <div class="px-3.5 py-1.5 text-[10px] text-meridian-300 border-t border-meridian-100 dark:border-white/10">↑↓ to navigate · Enter to select</div>
                      </div>
                    </td>

                    <!-- Dose: free text + quick chips -->
                    <td :class="cls.cell">
                      <input
                        v-model="d.dose" type="text" placeholder="1+0+1" :aria-label="`Dose for drug ${i + 1}`"
                        :class="[cls.plainInput, 'mb-2 font-mono']"
                      />
                      <div class="flex flex-wrap gap-1">
                        <button
                          v-for="chip in DOSE_CHIPS" :key="chip" type="button" @click="pickDoseChip(i, chip)"
                          :class="[cls.chipBase, 'font-mono', d.dose === chip ? cls.chipActive : cls.chipIdle]"
                        >{{ chip }}</button>
                      </div>
                    </td>

                    <!-- Instruction: free text + quick chips -->
                    <td :class="cls.cell">
                      <input
                        v-model="d.instruction" type="text" placeholder="খাবারের পর" :aria-label="`Instruction for drug ${i + 1}`"
                        :class="[cls.plainInput, 'mb-2']"
                      />
                      <div class="flex flex-wrap gap-1">
                        <button
                          v-for="chip in INSTRUCTION_CHIPS" :key="chip" type="button" @click="pickInstructionChip(i, chip)"
                          :class="[cls.chipBase, d.instruction === chip ? cls.chipActive : cls.chipIdle]"
                        >{{ chip }}</button>
                      </div>
                    </td>

                    <td :class="cls.cell">
                      <input
                        v-model="d.duration" type="text" placeholder="৭ দিন" :aria-label="`Duration for drug ${i + 1}`"
                        :class="cls.plainInput"
                      />
                    </td>

                    <td :class="[cls.cell, 'rounded-r-lg']">
                      <div class="flex items-center gap-1">
                        <button
                          type="button" @click="duplicateDrug(i)" title="Duplicate row" :aria-label="`Duplicate drug ${i + 1}`"
                          class="w-7 h-7 flex items-center justify-center rounded-full text-meridian-400 transition-colors hover:bg-meridian-100 hover:text-meridian-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400"
                        >
                          <IconCopy class="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button" @click="removeDrug(i)" title="Remove row" :aria-label="`Remove drug ${i + 1}`"
                          :class="cls.removeBtn"
                        >
                          <IconClose class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" @click="addDrug" :class="[cls.addBtn, 'mt-2']">
              <IconPlus class="w-4 h-4" /> Add drug
            </button>
          </div>

          <!-- 5. Advice -->
          <div v-show="activeTab === 'advice'" id="panel-advice" role="tabpanel" aria-labelledby="tab-advice">
            <header :class="cls.panelHeader">
              <h2 :class="cls.panelTitle">Advice &amp; Follow-up</h2>
              <p :class="cls.panelSub">উপদেশ ও পরবর্তী সাক্ষাতের তথ্য</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div>
                <h3 :class="cls.sectionTitle">উপদেশ</h3>
                <div class="space-y-2.5">
                  <div v-for="(a, i) in advice.notes" :key="i" :class="[cls.row, 'flex items-center gap-3']">
                    <input
                      v-model="advice.notes[i]" type="text" :aria-label="`Advice ${i + 1}`"
                      placeholder="নতুন উপদেশ যোগ করুন"
                      class="flex-1 bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                    />
                    <button type="button" @click="removeAdvice(i)" :aria-label="`Remove advice ${i + 1}`" :class="cls.removeBtn">
                      <IconClose class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button type="button" @click="addAdvice" :class="[cls.addBtn, 'mt-2.5']">
                  <IconPlus class="w-4 h-4" /> Add advice
                </button>
              </div>

              <div>
                <h3 :class="cls.sectionTitleMuted">Follow-up</h3>
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="fu-interval" :class="cls.label">পরবর্তী সাক্ষাৎ</label>
                    <div :class="[cls.box, 'relative']">
                      <select
                        id="fu-interval" v-model="advice.followUp.interval"
                        class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white appearance-none pr-6"
                      >
                        <option>১ সপ্তাহ</option>
                        <option>২ সপ্তাহ</option>
                        <option>১ মাস</option>
                        <option>৫ মাস</option>
                      </select>
                      <IconChevronDown class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-meridian-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label for="fu-date" :class="cls.label">তারিখ <span class="text-meridian-300 font-normal">(auto — editable)</span></label>
                    <div :class="cls.box">
                      <input
                        id="fu-date" v-model="advice.followUp.date" @input="onFollowUpDateInput" type="date"
                        class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="fu-visit" :class="cls.label">ভিজিট নং</label>
                    <div :class="cls.box">
                      <input id="fu-visit" v-model="advice.followUp.visitNo" type="text" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label for="fu-discount" :class="cls.label">ডিসকাউন্ট (৳)</label>
                    <div :class="cls.box">
                      <input id="fu-discount" v-model="advice.followUp.discount" type="text" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <label for="fu-referred" :class="cls.label">রেফার্ড বাই</label>
                  <div :class="cls.box">
                    <input id="fu-referred" v-model="advice.followUp.referredBy" type="text" class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. Report -->
          <div v-show="activeTab === 'report'" id="panel-report" role="tabpanel" aria-labelledby="tab-report">
            <header :class="cls.panelHeader">
              <h2 :class="cls.panelTitle">Report Entry</h2>
              <p :class="cls.panelSub">Lab / investigation results</p>
            </header>

            <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table class="w-full min-w-[600px] border-separate" style="border-spacing: 0 8px;">
                <thead>
                  <tr>
                    <th scope="col" :class="cls.th">Report name</th>
                    <th scope="col" :class="cls.th">Date</th>
                    <th scope="col" :class="cls.th">Result / Value</th>
                    <th scope="col" :class="cls.th">Unit</th>
                    <th scope="col" class="w-10"><span class="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in report.entries" :key="i" class="bg-meridian-50 dark:bg-white/5">
                    <td :class="[cls.cell, 'rounded-l-lg']"><input v-model="r.name" type="text" placeholder="e.g. CBC" :aria-label="`Report name ${i + 1}`" class="w-full bg-transparent outline-none font-semibold text-sm text-meridian-900 dark:text-white" /></td>
                    <td :class="cls.cell"><input v-model="r.date" type="date" :aria-label="`Report date ${i + 1}`" :class="cls.plainInput" /></td>
                    <td :class="cls.cell"><input v-model="r.result" type="text" placeholder="Result" :aria-label="`Result ${i + 1}`" :class="cls.plainInput" /></td>
                    <td :class="cls.cell"><input v-model="r.unit" type="text" placeholder="Unit" :aria-label="`Unit ${i + 1}`" :class="cls.plainInput" /></td>
                    <td :class="[cls.cell, 'rounded-r-lg']">
                      <button type="button" @click="removeReport(i)" :aria-label="`Remove report ${i + 1}`" :class="cls.removeBtn">
                        <IconClose class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" @click="addReport" :class="[cls.addBtn, 'mt-2']">
              <IconPlus class="w-4 h-4" /> Add report
            </button>
          </div>

          <!-- Step footer (one shared "Next" button for all steps) -->
          <div v-if="!isLastTab" class="mt-8 pt-5 border-t border-meridian-100 dark:border-white/10 flex justify-end">
            <button type="button" @click="goNextTab" :class="cls.primaryBtn">
              Next: {{ nextTabLabel }}
              <IconArrowRight class="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Prescription Preview Modal -->
        <!-- Prescription Preview Modal -->
    <BaseModal v-model="showPreview" title="Prescription Preview" size="lg">
     <div class="bg-white text-gray-800 border border-gray-100 rounded-xl overflow-hidden font-sans text-sm shadow-sm flex flex-col max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100vh-12rem)] [overflow-wrap:anywhere]">
        <!-- Top accent bar -->
        <div class="h-1.5 bg-pulse-600 shrink-0"></div>

       <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-8 space-y-5 sm:space-y-6">

          <!-- Doctor + Hospital header -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 class="text-xl font-bold tracking-tight text-pulse-600">{{ auth.user?.name || 'Dr. Marcus Reyes' }}</h2>
              <p class="text-xs text-gray-500 mt-1">MBBS, FCPS, MD (Internal Medicine)</p>
              <p class="text-xs text-gray-500">Specialist Physician</p>
            </div>
            <div class="flex items-center gap-3 sm:flex-row-reverse">
              <div class="w-12 h-12 rounded-lg border border-gray-100 bg-pulse-50 flex items-center justify-center text-pulse-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 9h1" /><path d="M14 9h1" /><path d="M9 13h1" /><path d="M14 13h1" /><path d="M10 21v-4h4v4" />
                </svg>
              </div>
              <div class="text-left sm:text-right text-xs text-gray-500 leading-relaxed">
                <p class="font-semibold text-gray-700">{{ auth.user?.hospital?.name || 'CareConnect Hospital' }}</p>
                <p v-if="auth.user?.hospital?.address">{{ auth.user.hospital.address }}</p>
                <p>Phone: {{ auth.user?.hospital?.phone || '+880 1700-000000' }}</p>
              </div>
            </div>
          </div>

          <!-- Patient info -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-2 bg-gray-50 px-4 py-3 rounded-lg text-xs font-medium border border-gray-100">
            <div><span class="text-gray-500">Name:</span> {{ patient.name || '—' }}</div>
            <div><span class="text-gray-500">Age:</span> {{ patient.age || '—' }}</div>
            <div><span class="text-gray-500">Sex:</span> {{ patient.sex || '—' }}</div>
            <div><span class="text-gray-500">Reg No:</span> {{ patient.regNo || '—' }}</div>
            <div><span class="text-gray-500">Date:</span> {{ patient.date }}</div>
          </div>

          <!-- Body (Left: clinical notes, Right: Rx) -->
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:min-h-[320px]">

            <!-- Left column -->
            <div class="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-gray-100 pb-5 sm:pb-0 sm:pr-5 space-y-5 text-xs">
              <div v-if="history.complaints.some(c => c.text)">
                <h4 class="font-bold uppercase tracking-wide text-gray-700 text-[11px] mb-1.5">C/C</h4>
                <ul class="list-disc pl-4 space-y-0.5 text-gray-600">
                  <li v-for="(c, i) in history.complaints.filter(c => c.text)" :key="i">
                    {{ c.text }} <span v-if="c.duration">({{ c.duration }})</span>
                  </li>
                </ul>
              </div>

              <div v-if="Object.values(vitals).some(v => v)">
                <h4 class="font-bold uppercase tracking-wide text-gray-700 text-[11px] mb-1.5">O/E</h4>
                <div class="space-y-0.5 text-gray-600">
                  <p v-if="vitals.bp">BP: {{ vitals.bp }} mmHg</p>
                  <p v-if="vitals.pulse">Pulse: {{ vitals.pulse }} b/m</p>
                  <p v-if="vitals.temp">Temp: {{ vitals.temp }} °F</p>
                  <p v-if="vitals.spo2">SpO2: {{ vitals.spo2 }}%</p>
                  <p v-if="vitals.rbs">RBS: {{ vitals.rbs }} mmol/L</p>
                </div>
              </div>

              <div v-if="dx.diagnoses.some(d => d)">
                <h4 class="font-bold uppercase tracking-wide text-gray-700 text-[11px] mb-1.5">Dx</h4>
                <ul class="list-disc pl-4 space-y-0.5 text-gray-600">
                  <li v-for="(d, i) in dx.diagnoses.filter(Boolean)" :key="i">{{ d }}</li>
                </ul>
              </div>

              <div v-if="report.entries.some(r => r.name)">
                <h4 class="font-bold uppercase tracking-wide text-gray-700 text-[11px] mb-1.5">Tests / Reports</h4>
                <ul class="list-disc pl-4 space-y-0.5 text-gray-600">
                  <li v-for="(r, i) in report.entries.filter(r => r.name)" :key="i">
                    {{ r.name }} <span v-if="r.result">- {{ r.result }} {{ r.unit }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Right column -->
            <div class="sm:col-span-8 flex flex-col gap-6">
              <h3 class="text-2xl font-bold font-serif text-gray-900">Rx</h3>

              <div class="space-y-4">
                <div v-for="(d, i) in rx.drugs.filter(d => d.brand)" :key="i" class="text-xs">
                  <div class="font-bold text-gray-900 text-sm">{{ i + 1 }}. {{ d.brand }}</div>
                  <div class="text-gray-600 pl-5 mt-0.5 leading-relaxed">
                    <span>{{ d.dose }}</span>
                    <span v-if="d.instruction"> — {{ d.instruction }}</span>
                    <span v-if="d.duration"> ({{ d.duration }})</span>
                  </div>
                </div>
              </div>

              <div v-if="advice.notes.some(a => a)" class="pt-5 border-t border-gray-100 text-xs">
                <h4 class="font-bold uppercase tracking-wide text-gray-700 text-[11px] mb-1.5">Advice</h4>
                <ul class="list-disc pl-4 text-gray-600 space-y-0.5">
                  <li v-for="(a, i) in advice.notes.filter(Boolean)" :key="i">{{ a }}</li>
                </ul>
              </div>

              <div v-if="advice.followUp.date" class="text-xs font-semibold text-gray-700">
                Next Visit: {{ advice.followUp.date }} ({{ advice.followUp.interval }})
              </div>

              <!-- Signature -->
              <div class="mt-auto pt-10 flex justify-end">
                <div class="w-44 border-t border-dashed border-gray-500 pt-1 text-center text-[11px] text-gray-500">
                  Doctor's signature
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Company promotion footer -->
       <div class="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-pulse-50 border-t border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-md bg-white border border-gray-100 flex items-center justify-center text-pulse-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div class="leading-tight">
              <p class="text-[11px] font-semibold text-gray-700">Issued digitally via CareConnect</p>
              <p class="hidden sm:block text-[10px] text-gray-500">Smart healthcare management platform</p>
            </div>
          </div>
          <p class="text-[11px] text-gray-500 sm:text-right">
            A product of <span class="font-semibold text-pulse-600">Authentic 4 Technology</span>
          </p>
        </div>

      </div>
    </BaseModal>

  </DashboardLayout>
</template>