let activeForms = [];

function addQuestion() {
    const list = document.getElementById('questions-list');
    const questionId = Date.now();
    const div = document.createElement('div');
    div.id = `q-${questionId}`;
    div.className = "p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-3 animate-in fade-in slide-in-from-left-2";
    div.innerHTML = `
        <div class="flex gap-3">
            <select onchange="updateQuestionType(${questionId}, this.value)" class="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 focus:outline-none focus:border-blue-500 transition-all">
                <option value="short">Short Answer</option>
                <option value="mcq">Multiple Choice</option>
                <option value="image">Image Submission</option>
            </select>
            <input type="text" placeholder="Question Title..." class="question-title flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white">
            <button onclick="document.getElementById('q-${questionId}').remove()" class="bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl px-4 transition-all">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div id="options-${questionId}" class="hidden space-y-2 pl-4 border-l border-white/10">
            <div class="choices-list space-y-2"></div>
            <button onclick="addChoice(${questionId})" class="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">+ Add Option</button>
        </div>
        <div id="image-hint-${questionId}" class="hidden pl-4 text-[9px] font-bold text-blue-500/50 uppercase tracking-widest italic">* Users limited to 10 image uploads</div>
    `;
    list.appendChild(div);
}

function updateQuestionType(id, type) {
    const optionsDiv = document.getElementById(`options-${id}`);
    const imageHint = document.getElementById(`image-hint-${id}`);
    optionsDiv.classList.toggle('hidden', type !== 'mcq');
    imageHint.classList.toggle('hidden', type !== 'image');
}

function addChoice(id, val = "") {
    const list = document.querySelector(`#options-${id} .choices-list`);
    const choice = document.createElement('input');
    choice.type = "text";
    choice.value = val;
    choice.placeholder = "Option text...";
    choice.className = "mcq-choice w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500/30 transition-all text-white";
    list.appendChild(choice);
}

function saveForm() {
    const titleInput = document.getElementById('new-form-title');
    const questionBlocks = document.querySelectorAll('#questions-list > div');
    if (!titleInput || !titleInput.value.trim()) return alert("Enter a Form Title.");

    const questions = Array.from(questionBlocks).map(block => ({
        type: block.querySelector('select').value,
        title: block.querySelector('.question-title').value,
        choices: Array.from(block.querySelectorAll('.mcq-choice')).map(c => c.value)
    }));

    const newForm = { id: Date.now(), title: titleInput.value, questions, date: new Date().toLocaleDateString() };
    activeForms.push(newForm);
    refreshUI();
    
    titleInput.value = '';
    document.getElementById('questions-list').innerHTML = '';
}

function refreshUI() {
    const liveContainer = document.getElementById('active-forms-container');
    const adminList = document.getElementById('admin-active-list');

    if (liveContainer) {
        liveContainer.innerHTML = activeForms.map(form => `
            <div onclick="openForm(${form.id})" class="relative group cursor-pointer transition-all duration-500 hover:scale-[1.01]">
                <div class="absolute -inset-0.5 bg-blue-500 rounded-[2rem] blur opacity-10 group-hover:opacity-30 transition"></div>
                <div class="relative p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/10 backdrop-blur-xl">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Available Application</p>
                            <h3 class="text-3xl font-extrabold text-white tracking-tighter">${form.title}</h3>
                        </div>
                        <i class="fas fa-chevron-right text-blue-500"></i>
                    </div>
                </div>
            </div>
            <div id="modal-${form.id}" class="hidden fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                <div class="w-full max-w-xl bg-[#050505] border border-white/10 p-10 rounded-[2.5rem] relative max-h-[90vh] overflow-y-auto">
                    <button onclick="closeForm(${form.id})" class="absolute top-6 right-6 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
                    <h3 class="text-3xl font-black text-white mb-8">${form.title}</h3>
                    <div class="space-y-6">${form.questions.map(q => renderQuestion(q, form.id)).join('')}</div>
                    <button class="w-full mt-10 bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/20">Submit Application</button>
                </div>
            </div>
        `).join('');
    }

    if (adminList) {
        adminList.innerHTML = activeForms.map(form => `
            <div class="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <div>
                    <p class="text-xs font-bold text-white">${form.title}</p>
                    <p class="text-[9px] text-gray-500 uppercase tracking-widest">${form.date}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="editForm(${form.id})" class="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteForm(${form.id})" class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('') || '<p class="text-[10px] text-gray-600 italic">No forms currently published.</p>';
    }
}

function renderQuestion(q, formId) {
    let html = `<div class="space-y-2"><label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">${q.title}</label>`;
    if (q.type === 'short') html += `<input type="text" placeholder="Your answer..." class="w-full bg-white/[0.05] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition">`;
    else if (q.type === 'mcq') html += q.choices.map(c => `<label class="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition"><input type="radio" name="q-${formId}-${q.title}" class="accent-blue-500"><span class="text-sm text-gray-400">${c}</span></label>`).join('');
    else if (q.type === 'image') html += `<div class="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-blue-500/30 transition cursor-pointer"><input type="file" multiple accept="image/*" class="hidden" id="f-${formId}"><p class="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Upload Images (Max 10)</p></div>`;
    return html + `</div>`;
}

function openForm(id) { document.getElementById(`modal-${id}`).classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeForm(id) { document.getElementById(`modal-${id}`).classList.add('hidden'); document.body.style.overflow = 'auto'; }

function deleteForm(id) { if (confirm("Delete this form?")) { activeForms = activeForms.filter(f => f.id !== id); refreshUI(); } }

function editForm(id) {
    const form = activeForms.find(f => f.id === id);
    if (!form) return;
    document.getElementById('new-form-title').value = form.title;
    const list = document.getElementById('questions-list');
    list.innerHTML = '';
    form.questions.forEach(q => {
        const qId = Date.now() + Math.random();
        addQuestion();
        const lastQ = list.lastElementChild;
        lastQ.querySelector('select').value = q.type;
        lastQ.querySelector('.question-title').value = q.title;
        updateQuestionType(lastQ.id.replace('q-', ''), q.type);
        if (q.type === 'mcq') q.choices.forEach(c => addChoice(lastQ.id.replace('q-', ''), c));
    });
    deleteForm(id);
}

document.addEventListener('DOMContentLoaded', () => {
    const publishBtn = document.querySelector('button[onclick="saveForm()"]');
    if (publishBtn && !document.getElementById('admin-active-list')) {
        const wrapper = document.createElement('div');
        wrapper.className = "mt-12 pt-8 border-t border-white/5";
        wrapper.innerHTML = `<h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Manage Active Forms</h3><div id="admin-active-list" class="space-y-3"></div>`;
        publishBtn.parentNode.appendChild(wrapper);
    }
});