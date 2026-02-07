function addQuestion() {
    const list = document.getElementById('questions-list');
    const questionId = Date.now();
    
    const div = document.createElement('div');
    div.id = `q-${questionId}`;
    div.className = "flex gap-3";
    div.innerHTML = `
        <input type="text" placeholder="Enter question..." 
               class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white">
        <button onclick="document.getElementById('q-${questionId}').remove()" 
                class="bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl px-4 transition-all">
            <i class="fas fa-times"></i>
        </button>
    `;
    list.appendChild(div);
}

function saveForm() {
    const titleInput = document.querySelector('input[placeholder="Form Title"]') || document.getElementById('form-title-input');
    const questionInputs = document.querySelectorAll('#questions-list input');
    const displayContainer = document.getElementById('active-forms-container');

    if (!titleInput || !titleInput.value.trim()) {
        alert("Please enter a Form Title.");
        return;
    }

    const questions = Array.from(questionInputs)
        .map(input => input.value)
        .filter(val => val.trim() !== "");

    if (displayContainer) {
        displayContainer.innerHTML = `
            <div id="active-published-form" 
                 class="relative overflow-hidden p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/5 shadow-2xl" 
                 data-tilt>
                
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50"></div>
                
                <div class="relative z-10">
                    <h3 class="text-3xl font-extrabold tracking-tighter mb-2 text-white">${titleInput.value}</h3>
                    <p class="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Official Application</p>
                    
                    <div class="space-y-6">
                        ${questions.map((q) => `
                            <div class="space-y-2">
                                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">${q}</label>
                                <input type="text" placeholder="Your answer..." 
                                       class="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/40 transition-all">
                            </div>
                        `).join('')}
                    </div>

                    <button class="w-full mt-10 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-500">
                        Submit Request
                    </button>
                </div>
            </div>
        `;

        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.1
            });
        }
        
        alert("Form Published!");
    }
}

function deleteActiveForm() {
    const activeForm = document.getElementById('active-published-form');
    if (activeForm) {
        if (confirm("Delete the active form?")) {
            activeForm.remove();
        }
    } else {
        alert("No active form found.");
    }
}