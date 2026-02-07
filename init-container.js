document.addEventListener('DOMContentLoaded', () => {
    let container = document.getElementById('active-forms-container');
    
    if (!container) {
        const formsPage = document.getElementById('forms-page');
        
        if (formsPage) {
            container = document.createElement('div');
            container.id = 'active-forms-container';
            container.className = "max-w-3xl mx-auto px-6 py-10 space-y-10 min-h-[200px]";
            
            const titleHeader = formsPage.querySelector('h2');
            if (titleHeader) {
                titleHeader.insertAdjacentElement('afterend', container);
            } else {
                formsPage.prepend(container);
            }
        } else {
            const mainBody = document.querySelector('body');
            container = document.createElement('div');
            container.id = 'active-forms-container';
            container.className = "fixed bottom-10 right-10 z-50 w-full max-w-md p-6";
            mainBody.appendChild(container);
        }
    }
});