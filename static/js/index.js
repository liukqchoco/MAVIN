// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Copied!';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Copied!';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

function pauseAllMedia(except) {
    document.querySelectorAll('video, audio').forEach(function(media) {
        if (media !== except && !media.paused) {
            media.pause();
        }
    });
}

function activateTab(tabGroup, activeButton) {
    const targetId = activeButton.dataset.tabTarget;
    const buttons = tabGroup.querySelectorAll('.tab-button');
    const panels = Array.from(tabGroup.children).filter(function(child) {
        return child.classList.contains('tab-panel');
    });

    buttons.forEach(function(button) {
        const isActive = button === activeButton;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach(function(panel) {
        const isActive = panel.id === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
        if (!isActive) {
            panel.querySelectorAll('video, audio').forEach(function(media) {
                media.pause();
            });
        }
    });
}

function setupTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function(tabGroup) {
        tabGroup.querySelectorAll('.tab-button').forEach(function(button) {
            button.addEventListener('click', function() {
                activateTab(tabGroup, button);
            });
        });
    });
}

function annotatePromptText() {
    const timeValue = '(?:\\d+(?:\\.\\d+)?|…)';
    const tokenPattern = new RegExp(
        '([“"][^”"\\n]+[”"])' +
        '|(\\(speech\\s+' + timeValue + '[–-]' + timeValue + 's\\))' +
        '|(\\(' + timeValue + '[–-]' + timeValue + 's\\))',
        'g'
    );

    document.querySelectorAll('.prompt-panel p').forEach(function(paragraph) {
        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let currentNode;

        while ((currentNode = walker.nextNode())) {
            if (!currentNode.parentElement.closest('.prompt-dialogue, .time-chip')) {
                textNodes.push(currentNode);
            }
        }

        textNodes.forEach(function(textNode) {
            const text = textNode.nodeValue;
            const matches = Array.from(text.matchAll(tokenPattern));
            if (matches.length === 0) return;

            const fragment = document.createDocumentFragment();
            let cursor = 0;

            matches.forEach(function(match) {
                fragment.append(text.slice(cursor, match.index));
                const annotation = document.createElement('span');
                annotation.textContent = match[0];

                if (match[1]) {
                    annotation.className = 'prompt-dialogue';
                } else if (match[2]) {
                    annotation.className = 'time-chip speech-time';
                } else {
                    annotation.className = 'time-chip shot-time';
                }

                fragment.append(annotation);
                cursor = match.index + match[0].length;
            });

            fragment.append(text.slice(cursor));
            textNode.replaceWith(fragment);
        });
    });
}

function setupMediaExclusivity() {
    document.querySelectorAll('video, audio').forEach(function(media) {
        media.addEventListener('play', function() {
            pauseAllMedia(media);
        });
    });
}

function setupVideoRestrictions() {
    document.querySelectorAll('video').forEach(function(video) {
        video.setAttribute('controlslist', 'nodownload noremoteplayback');
        video.setAttribute('disablepictureinpicture', '');
        video.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    annotatePromptText();
    setupMediaExclusivity();
    setupVideoRestrictions();
});
