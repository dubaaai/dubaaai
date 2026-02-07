document.addEventListener('DOMContentLoaded', () => {
    initFormContainer();
});

function initFormContainer() {
    const formsPage = document.getElementById('forms-page');
    
    if (formsPage) {
        if (!document.getElementById('active-forms-container')) {
            const container = document.createElement('div');
            container.id = 'active-forms-container';
            
            container.className = "max-w-2xl mx-auto mt-12 space-y-8 min-h-[100px] transition-all duration-700 ease-in-out";
            
            container.innerHTML = `
                <div id="empty-state" class="text-center py-20 border border-dashed border-white/5 rounded-[2rem]">
                    <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">No Active Forms Published</p>
                </div>
            `;
            
            formsPage.appendChild(container);
        }
    }
}

function injectFormWithEffect(htmlContent) {
    const container = document.getElementById('active-forms-container');
    if (!container) return;

    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    setTimeout(() => {
        container.innerHTML = htmlContent;
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300);
}