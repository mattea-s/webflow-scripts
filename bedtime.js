(function() {
    if (window.af3dInitialized) return;
    window.af3dInitialized = true;

let baseimg3Listener = null;
let errorTransitionListener = null;
let lastScrollTop = 0;
let progressState = false;

// Add transition CSS
const style = document.createElement('style');
style.textContent = `
    /* Base transitions for all elements that might change */
    .dim-screen,
    .queue-modal-background,
    .queued-jobs-wrap,
    .error-popup-wrapper,
    .error-notif-wrapper,
    #queue-modal,
    #jobs-empty,
    #to-queue1, #to-queue2, #to-queue3, #to-queue4, #to-queue5,
    #baseimg2, #baseimg3, #baseimg4, #baseimg5, #baseimg6, #baseimg7 {
        transition: all 0.4s ease-in-out;
    }

/* Progress bar transitions */
    #p-slow-1, #p-slow-2,
    #p-med-1, #p-med-2,
    #p-fast-1, #p-fast-2, #p-fast-3, #p-fast-4 {
        transition: width 2000ms ease-in-out;
    }

/* In Production progress bar transitions*/
    #d-50-1, #d-50-2, #p-50, #d-10, #p-10, #p-100, #p-25, #c12, #c22, #c32, #c42 {
        transition: width 800ms ease-in-out;
    }

    /* Position transitions for queue items */
    #in-queue1, #in-queue15, #in-queue2, #in-queue3, #in-queue35, #in-queue4, #in-queue5 {
        transition: transform 0.8s ease-in-out,
                    top 0.8s ease-in-out,
                    left 0.8s ease-in-out,
                    right 0.8s ease-in-out,
                    box-shadow 0.8s ease-in-out,
                    width 0.8s ease-in-out,
                    height 0.8s ease-in-out;
    }
`;
document.head.appendChild(style);

// Viewport-specific scroll percentages
const scrollBreakpoints = {
    desktop1920: {
        minWidth: 1920,
        percentages: {
            jobSend: 2.4,
            showQueue: 5,
            jobRouteReady: 7.25,
            jobRoute: 7.3,
            toPrinters: 7.8,
            startJobStatic: 8.8,
            startJobFill: 9.35,
            failNotif: 14.25,
            queueProgress: 15.8,
            showJobBreakdown: 16.5,
            hideJobBreakdown: 17.75,
            collectPage: 18,
            collectFill: 18.75
        }
    },
    desktop1440: {
        minWidth: 1440,
        percentages: {
            jobSend: 3,
            showQueue: 6.25,
            jobRouteReady: 8.15,
            jobRoute: 8.2,
            toPrinters: 9.3,
            startJobStatic: 10.3,
            startJobFill: 11,
            failNotif: 16.36,
            queueProgress: 18,
            showJobBreakdown: 19,
            hideJobBreakdown: 19.75,
            collectPage: 20,
            collectFill: 20.5
        }
    },
    desktop992: {
        minWidth: 992,
        percentages: {
            jobSend: 3.75,
            showQueue: 6.5,
            jobRouteReady: 8.45,
            jobRoute: 8.5,
            toPrinters: 9.2,
            startJobStatic: 10.8,
            startJobFill: 11.15,
            failNotif: 16.75,
            queueProgress: 18.5,
            showJobBreakdown: 19,
            hideJobBreakdown: 20,
            collectPage: 20.4,
            collectFill: 21
        }
    },
    tablet: {
        minWidth: 768,
        percentages: {
            jobSend: 3,
            showQueue: 10,
            jobRouteReady: 12.45,
            jobRoute: 12.5,
            toPrinters: 13,
            startJobStatic: 14,
            startJobFill: 14.5,
            failNotif: 19.5,
            queueProgress: 21.5,
            showJobBreakdown: 22.4,
            hideJobBreakdown: 23.25,
            collectPage: 23.5,
            collectFill: 24.5
        }
    },
    mobileLandscape: {
        minWidth: 479,
        percentages: {
            jobSend: 2.75,
            showQueue: 9,
            jobRouteReady: 11.25,
            jobRoute: 11.3,
            toPrinters: 11.8,
            startJobStatic: 12.75,
            startJobFill: 13.5,
            failNotif: 19.15,
            queueProgress: 21,
            showJobBreakdown: 21.5,
            hideJobBreakdown: 23.5,
            collectPage: 23.75,
            collectFill: 24
        }
    },
    mobile: {
        minWidth: 0,
        percentages: {
            jobSend: 2.75,
            showQueue: 9,
            jobRouteReady: 11.25,
            jobRoute: 11.3,
            toPrinters: 11.8,
            startJobStatic: 12.75,
            startJobFill: 13.5,
            failNotif: 19.15,
            queueProgress: 21,
            showJobBreakdown: 21.5,
            hideJobBreakdown: 23.5,
            collectPage: 23.75,
            collectFill: 24
        }
    }
};

// Function to get current breakpoint percentages
function getCurrentBreakpoint() {
    try {
        const width = window.innerWidth;
        const breakpoints = Object.values(scrollBreakpoints).sort((a, b) => b.minWidth - a.minWidth);
        const currentBreakpoint = breakpoints.find(bp => width >= bp.minWidth);
        console.log(`Current viewport width: ${width}px, using breakpoint: ${currentBreakpoint.minWidth}`);
        return currentBreakpoint.percentages;
    } catch (error) {
        console.error('Error getting breakpoint:', error);
        return scrollBreakpoints.desktop1440.percentages; // Fallback to a safe default
    }
}

// Wait for Webflow to be ready
window.Webflow = window.Webflow || [];
window.Webflow.push(function() {
    console.log('Webflow is ready');
    let currentPercentages = getCurrentBreakpoint();

    // Update percentages on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            currentPercentages = getCurrentBreakpoint();
        }, 250);
    }, { passive: true });

    let isHandlingScroll = false;

    function handleScroll() {
      if (isHandlingScroll) return;
      isHandlingScroll = true;

      requestAnimationFrame(() => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / windowHeight) * 100;
        console.log('Current scroll percentage:', scrollPercent.toFixed(2) + '%');
        const baseimg3 = document.querySelector('#baseimg3');
        const baseimg4 = document.querySelector('#baseimg4');
        const baseimg5 = document.querySelector('#baseimg5');
        const baseimg6 = document.querySelector('#baseimg6');
        const baseimg7 = document.querySelector('#baseimg7');
        const progressWrapper = document.querySelector('.progress-bar-wrapper');
        const errorbar = document.querySelector('#p-med-2');
        const med2Bar = document.querySelector('#p-med-2');
        const errorpopup = document.querySelector('.error-popup-wrapper');
        const errornotif = document.querySelector('.error-notif-wrapper');
        const jobProgress = document.querySelector('#job-progress');
        const jobProgPopup = document.querySelector('#progress-popup');
        const prog100 = document.querySelector('#p-100');
        const prog25 = document.querySelector('#p-25');
        const toCollect = document.querySelector('#collect-wrap');
        const prodWrap = document.querySelector('#prod-wrap');
        const col1 = document.querySelector('#c12');
        const col2 = document.querySelector('#c22');
        const col3 = document.querySelector('#c32');
        const col4 = document.querySelector('#c42');
        const j1 = document.querySelector('#j1');
        const j2 = document.querySelector('#j2');
        const j3 = document.querySelector('#j3');
        const j4 = document.querySelector('#j4');

            if (!baseimg3 || !baseimg4 || !baseimg5 || !baseimg6 || !baseimg7) {
    console.warn('Missing one or more baseimg elements');
    }
    if (!progressWrapper || !errorbar || !med2Bar || !errorpopup || !errornotif) {
    console.warn('Missing one or more UI control elements');
    }
        
        // Get current breakpoint percentages
        const bp = currentPercentages;

        // Job Send
        const firstScreen = document.querySelector('.first-screen');
        const secondScreen = document.querySelector('.second-screen');
        
        if (scrollPercent >= bp.jobSend) {
            secondScreen?.classList.remove('hide');
        } else {
            secondScreen?.classList.add('hide');
        }

        // Show Queue
        const elements = {
            dimScreen: document.querySelector('.dim-screen'),
            queueModalBg: document.querySelector('.queue-modal-background'),
            queuedJobsWrap: document.querySelector('.queued-jobs-wrap'),
            queueModal: document.querySelector('#queue-modal'),
            jobsEmpty: document.querySelector('#jobs-empty')
        };
                  // Add route classes
            const queueItems = {
                inQueue1: document.querySelector('#in-queue1'),
                inQueue15: document.querySelector('#in-queue15'),
                inQueue2: document.querySelector('#in-queue2'),
                inQueue3: document.querySelector('#in-queue3'),
                inQueue35: document.querySelector('#in-queue35'),
                inQueue4: document.querySelector('#in-queue4'),
                inQueue5: document.querySelector('#in-queue5')
            };

        if (scrollPercent >= bp.showQueue) {
            elements.dimScreen?.classList.add('undim');
            elements.queueModalBg?.classList.add('queued');
            elements.queuedJobsWrap?.classList.add('queued');
            elements.queueModal?.classList.add('hide');
            elements.jobsEmpty?.classList.remove('hide');

            for (let i = 1; i <= 5; i++) {
                const toQueue = document.querySelector(`#to-queue${i}`);
                const inQueue = document.querySelector(`#in-queue${i}`);
                toQueue?.classList.add('hide');
                inQueue?.classList.remove('hide');
            }
            
            // Handle additional queue items
            const inQueue15 = document.querySelector('#in-queue15');
            const inQueue35 = document.querySelector('#in-queue35');
            inQueue15?.classList.remove('hide');
            inQueue35?.classList.remove('hide');

            queueItems.inQueue1?.classList.add('a-arm-route');
            queueItems.inQueue15?.classList.add('a-arm-route');
            queueItems.inQueue2?.classList.add('a-base-route');
            queueItems.inQueue3?.classList.add('b-route');
            queueItems.inQueue35?.classList.add('b-route');
            queueItems.inQueue4?.classList.add('c-route');
            queueItems.inQueue5?.classList.add('d-route');
        } else {
            elements.dimScreen?.classList.remove('undim');
            elements.queueModalBg?.classList.remove('queued');
            elements.queuedJobsWrap?.classList.remove('queued');
            elements.queueModal?.classList.remove('hide');
            elements.jobsEmpty?.classList.add('hide');

            for (let i = 1; i <= 5; i++) {
                const toQueue = document.querySelector(`#to-queue${i}`);
                const inQueue = document.querySelector(`#in-queue${i}`);
                toQueue?.classList.remove('hide');
                inQueue?.classList.add('hide');
            }
            
            // Handle additional queue items
            const inQueue15 = document.querySelector('#in-queue15');
            const inQueue35 = document.querySelector('#in-queue35');
            inQueue15?.classList.add('hide');
            inQueue35?.classList.add('hide');

            // Remove route classes
            queueItems.inQueue1?.classList.remove('a-arm-route');
            queueItems.inQueue15?.classList.remove('a-arm-route');
            queueItems.inQueue2?.classList.remove('a-base-route');
            queueItems.inQueue3?.classList.remove('b-route');
            queueItems.inQueue35?.classList.remove('b-route');
            queueItems.inQueue4?.classList.remove('c-route');
            queueItems.inQueue5?.classList.remove('d-route');
        }

        // Job Route Ready
        if (scrollPercent >= bp.jobRouteReady) {
            elements.queuedJobsWrap?.classList.add('ready');
            elements.jobsEmpty?.classList.add('hide');
            elements.queueModalBg?.classList.add('done');
        } else {
            elements.queuedJobsWrap?.classList.remove('ready');
            elements.queueModalBg?.classList.remove('done');
        }

        // Job Route
        if (scrollPercent >= bp.jobRoute) {
            elements.queuedJobsWrap?.classList.add('go');
         
        // Delay then move in-queue items
            setTimeout(() => {
              queueItems.inQueue1?.classList.add('ready');
              queueItems.inQueue15?.classList.add('ready');
              queueItems.inQueue2?.classList.add('ready');
              queueItems.inQueue3?.classList.add('ready');
              queueItems.inQueue35?.classList.add('ready');
              queueItems.inQueue4?.classList.add('ready');
              queueItems.inQueue5?.classList.add('ready');
            }, 200);
        } else {
            elements.queuedJobsWrap?.classList.remove('go');
            // Remove ready class from all in-queue elements
            queueItems.inQueue1?.classList.remove('ready');
            queueItems.inQueue15?.classList.remove('ready');
            queueItems.inQueue2?.classList.remove('ready');
            queueItems.inQueue3?.classList.remove('ready');
            queueItems.inQueue35?.classList.remove('ready');
            queueItems.inQueue4?.classList.remove('ready');
            queueItems.inQueue5?.classList.remove('ready');
        }

        // To Printers
        if (scrollPercent >= bp.toPrinters) {
            queueItems.inQueue1?.classList.add('pos-1');
            queueItems.inQueue15?.classList.add('pos-1-5');
            queueItems.inQueue2?.classList.add('pos-2');
            queueItems.inQueue3?.classList.add('pos-3');
            queueItems.inQueue35?.classList.add('pos-3-5');
            queueItems.inQueue4?.classList.add('pos-4');
            queueItems.inQueue5?.classList.add('pos-5');
            // Add listener to detect when the last position transition completes
            if (!baseimg3Listener && queueItems.inQueue5) {
              baseimg3Listener = function showImg() {
                setTimeout(() => {
                  baseimg3?.classList.remove('hide');
              }, 200);
        queueItems.inQueue5.removeEventListener('transitionend', baseimg3Listener);
            baseimg3Listener = null;
        };
        queueItems.inQueue5.addEventListener('transitionend', baseimg3Listener);
    }
        } else {
            queueItems.inQueue1?.classList.remove('pos-1');
            queueItems.inQueue15?.classList.remove('pos-1-5');
            queueItems.inQueue2?.classList.remove('pos-2');
            queueItems.inQueue3?.classList.remove('pos-3');
            queueItems.inQueue35?.classList.remove('pos-3-5');
            queueItems.inQueue4?.classList.remove('pos-4');
            queueItems.inQueue5?.classList.remove('pos-5');

         // Clean up listener and hide image when scrolling back
         if (baseimg3Listener && queueItems.inQueue5) {
          queueItems.inQueue5.removeEventListener('transitionend', baseimg3Listener);
            baseimg3Listener = null;
    }
    baseimg3?.classList.add('hide');
  }

        // Start Job Static
        if (scrollPercent >= bp.startJobStatic && scrollPercent < bp.queueProgress) {
            baseimg4?.classList.remove('hide');
            progressWrapper?.classList.remove('hide');
        } else {
            baseimg4?.classList.add('hide');
            progressWrapper?.classList.add('hide');          
        }

        const scrollDirection = window.scrollY > lastScrollTop ? 'down' : 'up';
lastScrollTop = window.scrollY;
if (scrollPercent >= bp.startJobFill) {
    if (!progressState || scrollDirection === 'down') {
        // Reset and start animations for downward scroll
        progressState = true;
        
        // Add fill classes to progress bars
        ['#p-slow-1', '#p-slow-2'].forEach(id => {
            const el = document.querySelector(id);
            if (el) {
                el.classList.remove('fill-30');
                // Force reflow
                void el.offsetWidth;
                el.classList.add('fill-30');
            }
        });
        
        ['#p-med-1', '#p-med-2'].forEach(id => {
            const el = document.querySelector(id);
            if (el) {
                el.classList.remove('fill-60');
                void el.offsetWidth;
                el.classList.add('fill-60');
            }
        });
        
        ['#p-fast-1', '#p-fast-2', '#p-fast-3', '#p-fast-4'].forEach(id => {
            const el = document.querySelector(id);
            if (el) {
                el.classList.remove('fill-100');
                void el.offsetWidth;
                el.classList.add('fill-100');
            }
        });

        // Reset and add error listener
        if (errorbar) {
            errorbar.classList.remove('error');
            void errorbar.offsetWidth;
        }
        
        if (!errorTransitionListener) {
            errorTransitionListener = function showError() {
                setTimeout(() => {
                    baseimg5?.classList.remove('hide');
                    errorbar?.classList.add('error');
                    setTimeout(() => {
                        errorpopup?.classList.remove('hide');
                    }, 400);
                }, 200);
                med2Bar?.removeEventListener('transitionend', errorTransitionListener);
                errorTransitionListener = null;
            };
            med2Bar?.addEventListener('transitionend', errorTransitionListener);
        }
    }
} else {
    // Reset state when scrolling up past the trigger point
    progressState = false;
    ['#p-slow-1', '#p-slow-2'].forEach(id => {
        document.querySelector(id)?.classList.remove('fill-30');
    });
    
    ['#p-med-1', '#p-med-2'].forEach(id => {
        document.querySelector(id)?.classList.remove('fill-60');
    });
    
    ['#p-fast-1', '#p-fast-2', '#p-fast-3', '#p-fast-4'].forEach(id => {
        document.querySelector(id)?.classList.remove('fill-100');
    });
    
    errorbar?.classList.remove('error');
}

        // Early hide for baseimg5 when scrolling up
if (scrollPercent < bp.startJobFill) {
    baseimg5?.classList.add('hide');
}

        // Fail Notification
        if (scrollPercent >= bp.failNotif && scrollPercent < bp.queueProgress) {
            errornotif?.classList.remove('hide');
            setTimeout(() => {
                errornotif?.classList.add('alert');
            }, 100);
        } else {
            errornotif?.classList.remove('alert');
            setTimeout(() => {
                errornotif?.classList.add('hide');
            }, 100);
        }

        // Queue Progress
        if (scrollPercent >= bp.queueProgress) {
            baseimg6?.classList.remove('hide');
      jobProgress?.classList.remove('hide');
      setTimeout(() => {
        ['#p-50', '#d-50-1', '#d-50-2'].forEach(id => {
        document.querySelector(id)?.classList.add('prog-50');
        });

        ['#d-10', '#p-10'].forEach(id => {
        document.querySelector(id)?.classList.add('prog-10');
        });

        prog100?.classList.add('prog-100');
        prog25?.classList.add('prog-25');
       }, 100);
     } else {
        ['#p-50', '#d-50-1', '#d-50-2'].forEach(id => {
        document.querySelector(id)?.classList.remove('prog-50');
        });

        ['#d-10', '#p-10'].forEach(id => {
        document.querySelector(id)?.classList.remove('prog-10');
        });

        prog100?.classList.remove('prog-100');
        prog25?.classList.remove('prog-25');

      baseimg6?.classList.add('hide');
      jobProgress?.classList.add('hide');
      jobProgPopup?.classList.add('hide');
     }

        // Show & Hide Job Breakdown
        if (scrollPercent >= bp.showJobBreakdown && scrollPercent < bp.hideJobBreakdown) {
            jobProgPopup?.classList.remove('hide');
        } else {
            jobProgPopup?.classList.add('hide');
        }

        // Collect Page
        if (scrollPercent >= bp.collectPage) {
           baseimg7?.classList.remove('hide');
           toCollect?.classList.remove('hide');
           prodWrap?.classList.add('hide');
       } else {
           baseimg7?.classList.add('hide');
           toCollect?.classList.add('hide');
           prodWrap?.classList.remove('hide');
       }

        // Collect Fill
        if (scrollPercent >= bp.collectFill) {
            setTimeout(() => {
        col1?.classList.add('col-50');
      }, 100);
      setTimeout(() => {
        j1?.classList.add('hide');
        col2?.classList.add('col-50');
      }, 900);
      setTimeout(() => {
        j2?.classList.add('hide');
        col3?.classList.add('col-10');
      }, 1700);
      setTimeout(() => {
        j3?.classList.add('hide');
        col4?.classList.add('col-25');
      }, 2500);
      setTimeout(() => {
        j4?.classList.add('hide');
      }, 3300);
    } else {
     col1?.classList.remove('col-50');
     col2?.classList.remove('col-50');
     col3?.classList.remove('col-10');
     col4?.classList.remove('col-25');
     j1?.classList.remove('hide');
     j2?.classList.remove('hide');
     j3?.classList.remove('hide');
     j4?.classList.remove('hide');
    }
    isHandlingScroll = false;
   });
  }

    // Add scroll listener with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                updatePosition();
                scrollTimeout = null;
            }, 10);
        }
    }, { passive: true });

  // Add position handling
function updatePosition() {
    const fixedContainer = document.querySelector('.div-block-390');
    const section = document.querySelector('.section_how-af3d-works');
    const tasksWrapper = document.querySelector('.af3d-tasks-wrapper');
    
    if (!fixedContainer || !section || !tasksWrapper) return;
    
    const tasksRect = tasksWrapper.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Switch to absolute when section is leaving viewport
    if (sectionRect.bottom <= viewportHeight && tasksRect.bottom <= viewportHeight) {
        fixedContainer.style.position = 'absolute';
        fixedContainer.style.bottom = '0';
        fixedContainer.style.top = 'auto';
    } else {
        fixedContainer.style.position = 'fixed';
        fixedContainer.style.bottom = '';
        fixedContainer.style.top = '';
    }
}

    // Check initial scroll position
    handleScroll();
    updatePosition();
});
})();
