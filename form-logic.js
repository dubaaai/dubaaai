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
        <div id="image-hint-${questionId}" class="hidden pl-4 text-[9px] font-bold text-blue-500/50 uppercase tracking-widest italic">
            * Users limited to 10 image uploads
        </div>
    `;
    list.appendChild(div);
}

function updateQuestionType(id, type) {
    const optionsDiv = document.getElementById(`options-${id}`);
    const imageHint = document.getElementById(`image-hint-${id}`);
    optionsDiv.classList.toggle('hidden', type !== 'mcq');
    imageHint.classList.toggle('hidden', type !== 'image');
}

function addChoice(id) {
    const list = document.querySelector(`#options-${id} .choices-list`);
    const choice = document.createElement('input');
    choice.type = "text";
    choice.placeholder = "Option text...";
    choice.className = "mcq-choice w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500/30 transition-all text-white";
    list.appendChild(choice);
}

function saveForm() {
    const titleInput = document.getElementById('new-form-title');
    const questionBlocks = document.querySelectorAll('#questions-list > div');
    const displayContainer = document.getElementById('active-forms-container');

    if (!titleInput || !titleInput.value.trim()) {
        alert("Please enter a Form Title.");
        return;
    }

    let formHTML = `
        <div id="active-published-form" class="relative overflow-hidden p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/5 shadow-2xl" data-tilt>
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50"></div>
            <div class="relative z-10">
                <h3 class="text-3xl font-extrabold tracking-tighter mb-2 text-white">${titleInput.value}</h3>
                <p class="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Official Application</p>
                <div class="space-y-8">
    `;

    questionBlocks.forEach(block => {
        const title = block.querySelector('.question-title').value;
        const type = block.querySelector('select').value;

        formHTML += `<div class="space-y-3"><label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">${title}</label>`;

        if (type === 'short') {
            formHTML += `<input type="text" placeholder="Your answer..." class="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/40 transition-all">`;
        } else if (type === 'mcq') {
            const choices = block.querySelectorAll('.mcq-choice');
            choices.forEach(c => {
                formHTML += `
                    <label class="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all group">
                        <input type="radio" name="q-${block.id}" class="accent-blue-500">
                        <span class="text-sm text-gray-400 group-hover:text-white transition">${c.value}</span>
                    </label>
                `;
            });
        } else if (type === 'image') {
            formHTML += `
                <div class="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-blue-500/30 transition-all group">
                    <input type="file" multiple accept="image/*" onchange="if(this.files.length > 10) { alert('Max 10 images allowed'); this.value = ''; }" class="absolute inset-0 opacity-0 cursor-pointer">
                    <div class="pointer-events-none">
                        <i class="fas fa-cloud-upload-alt text-2xl text-gray-600 group-hover:text-blue-500 transition-all mb-2"></i>
                        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Click or drag images (Max 10)</p>
                    </div>
                </div>
            `;
        }
        formHTML += `</div>`;
    });

    formHTML += `
                <button class="w-full mt-10 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-500">Submit Request</button>
            </div>
        </div>
    `;

    if (displayContainer) {
        displayContainer.innerHTML = formHTML;
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 10, speed: 400, glare: true, "max-glare": 0.1 });
        }
        alert("Form Published!");
    } else {
        alert("Error: No container found to display the form.");
    }
}

function deleteActiveForm() {
    const activeForm = document.getElementById('active-published-form');
    if (activeForm && confirm("Delete the active form?")) {
        activeForm.remove();
    } else if (!activeForm) {
        alert("No active form found.");
    }
}