let activeFormState = null;


function publishForm() {
    const titleInput = document.getElementById('admin-form-title');
    const descInput = document.getElementById('admin-form-desc');
    const container = document.getElementById('active-forms-container');

    if (!titleInput || !titleInput.value.trim()) {
        alert("Please enter a Form Title before publishing.");
        return;
    }

    activeFormState = {
        title: titleInput.value,
        description: descInput ? descInput.value : "",
        timestamp: new Date().toLocaleDateString()
    };

    if (container) {
        container.innerHTML = `
            <div id="live-custom-form" class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm" data-tilt>
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-extrabold text-blue-500">${activeFormState.title}</h3>
                    <span class="text-xs text-gray-500 uppercase tracking-widest">${activeFormState.timestamp}</span>
                </div>
                <p class="text-gray-400 mb-6">${activeFormState.description}</p>
                <button class="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">
                    OPEN FORM
                </button>
            </div>
        `;

        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
        }
        
        alert("Form is now live!");
    } else {
        console.error("Error: Element #active-forms-container not found on the page.");
    }
}

function deleteActiveForm() {
    const container = document.getElementById('active-forms-container');
    
    if (container && container.innerHTML.trim() !== "") {
        if (confirm("Are you sure you want to delete the active form?")) {
            container.innerHTML = "";
            activeFormState = null;
            alert("Form deleted successfully.");
        }
    } else {
        alert("There is no active form to delete.");
    }
}