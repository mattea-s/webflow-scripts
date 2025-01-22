document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, adding FAQ click listeners');
    
    function waitForTransition(element) {
        return new Promise(resolve => {
            element.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'max-height') {
                    element.removeEventListener('transitionend', handler);
                    resolve();
                }
            });
        });
    }

    function prepareElementForTransition(element) {
        element.style.transition = 'none';
        const currentHeight = element.scrollHeight;
        element.style.maxHeight = currentHeight + 'px';
        element.offsetHeight;
        element.style.transition = '';
        return currentHeight;
    }

    function setClosingState(element, isClosing) {
        const wrapper = element.querySelector('.faq-wrapper');
        if (isClosing) {
            element.dataset.closing = 'true';
            wrapper.dataset.closing = 'true';
        } else {
            delete element.dataset.closing;
            delete wrapper.dataset.closing;
        }
    }

    document.addEventListener('click', async function(event) {
        const faqElement = event.target.closest('.faq-outline');
        
        if (!faqElement) return;
        
        if (faqElement.dataset.transitioning === 'true') return;
        
        if (faqElement.classList.contains('closed')) {
            const openFaqs = document.querySelectorAll('.faq-outline:not(.closed)');
            const transitions = [];
            
            faqElement.dataset.transitioning = 'true';
            openFaqs.forEach(faq => faq.dataset.transitioning = 'true');
            
            // Prepare all elements for transition
            openFaqs.forEach(otherFaq => {
                prepareElementForTransition(otherFaq);
                // Add closing state for slower transition
                setClosingState(otherFaq, true);
            });

            // Prepare clicked element
            faqElement.style.maxHeight = '74px';
            const targetHeight = Math.max(faqElement.scrollHeight, 400);
            // Remove closing state
            setClosingState(faqElement, false);
            
            document.body.offsetHeight;
            
            requestAnimationFrame(() => {
                openFaqs.forEach(otherFaq => {
                    otherFaq.style.maxHeight = '74px';
                    const transitionPromise = waitForTransition(otherFaq).then(() => {
                        otherFaq.classList.add('closed');
                        otherFaq.querySelectorAll('*').forEach(child => {
                            child.classList.add('closed');
                        });
                        otherFaq.dataset.transitioning = 'false';
                        setClosingState(otherFaq, false);
                    });
                    transitions.push(transitionPromise);
                });
                
                faqElement.classList.remove('closed');
                faqElement.querySelectorAll('*').forEach(child => {
                    child.classList.remove('closed');
                });
                faqElement.style.maxHeight = targetHeight + 'px';
                
                const openingTransition = waitForTransition(faqElement).then(() => {
                    faqElement.dataset.transitioning = 'false';
                });
                transitions.push(openingTransition);
            });
            
            await Promise.all(transitions);
            
        } else {
            faqElement.dataset.transitioning = 'true';
            setClosingState(faqElement, true);
            
            prepareElementForTransition(faqElement);
            
            faqElement.offsetHeight;
            
            requestAnimationFrame(() => {
                faqElement.style.maxHeight = '74px';
            });
            
            await waitForTransition(faqElement);
            
            faqElement.classList.add('closed');
            faqElement.querySelectorAll('*').forEach(child => {
                child.classList.add('closed');
            });
            faqElement.dataset.transitioning = 'false';
            setClosingState(faqElement, false);
        }
    });
});
