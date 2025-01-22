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
    #d-50-1, #d-50-2, #p-50, #d-10, #p-10, #p-100, #p-25, #c12, c22, #c32, #c42 {
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

// Wait for Webflow to be ready
window.Webflow = window.Webflow || [];
window.Webflow.push(function() {
    console.log('Webflow is ready');

// Define viewport breakpoints
const BREAKPOINTS = {
    MOBILE: 478,
    LANDSCAPE: 767,
    TABLET: 991,
    DESKTOP: 1439,
    WIDE: 1920
};

// Scroll trigger points for each viewport range
const SCROLL_TRIGGERS = {
    // Format: [start, end] percentages
    JOB_SEND: {
        [BREAKPOINTS.MOBILE]: 2.75,
        [BREAKPOINTS.LANDSCAPE]: 3,
        [BREAKPOINTS.TABLET]: 3.75,
        [BREAKPOINTS.DESKTOP]: 3,
        [BREAKPOINTS.WIDE]: 2.4
    },
    SHOW_QUEUE: {
        [BREAKPOINTS.MOBILE]: 9,
        [BREAKPOINTS.LANDSCAPE]: 10,
        [BREAKPOINTS.TABLET]: 6.5,
        [BREAKPOINTS.DESKTOP]: 6.25,
        [BREAKPOINTS.WIDE]: 5
    },
    JOB_ROUTE_READY: {
        [BREAKPOINTS.MOBILE]: 11.25,
        [BREAKPOINTS.LANDSCAPE]: 12.45,
        [BREAKPOINTS.TABLET]: 8.45,
        [BREAKPOINTS.DESKTOP]: 8.15,
        [BREAKPOINTS.WIDE]: 7.25
    },
    JOB_ROUTE: {
        [BREAKPOINTS.MOBILE]: 11.3,
        [BREAKPOINTS.LANDSCAPE]: 12.5,
        [BREAKPOINTS.TABLET]: 8.5,
        [BREAKPOINTS.DESKTOP]: 8.2,
        [BREAKPOINTS.WIDE]: 7.3
    },
    TO_PRINTERS: {
        [BREAKPOINTS.MOBILE]: 11.8,
        [BREAKPOINTS.LANDSCAPE]: 13,
        [BREAKPOINTS.TABLET]: 9.2,
        [BREAKPOINTS.DESKTOP]: 9.3,
        [BREAKPOINTS.WIDE]: 7.8
    },
    START_JOB_STATIC: {
        [BREAKPOINTS.MOBILE]: 12.75,
        [BREAKPOINTS.LANDSCAPE]: 14,
        [BREAKPOINTS.TABLET]: 10.8,
        [BREAKPOINTS.DESKTOP]: 10.3,
        [BREAKPOINTS.WIDE]: 8.8
    },
    START_JOB_FILL: {
        [BREAKPOINTS.MOBILE]: 13.5,
        [BREAKPOINTS.LANDSCAPE]: 14.5,
        [BREAKPOINTS.TABLET]: 11.15,
        [BREAKPOINTS.DESKTOP]: 11,
        [BREAKPOINTS.WIDE]: 9.35
    },
      FAIL_NOTIF: {
        [BREAKPOINTS.MOBILE]: 19.15,
        [BREAKPOINTS.LANDSCAPE]: 19.5,
        [BREAKPOINTS.TABLET]: 16.75,
        [BREAKPOINTS.DESKTOP]: 16.36,
        [BREAKPOINTS.WIDE]: 14.25
    },
    QUEUE_PROGRESS: {
        [BREAKPOINTS.MOBILE]: 21,
        [BREAKPOINTS.LANDSCAPE]: 21.5,
        [BREAKPOINTS.TABLET]: 18.5,
        [BREAKPOINTS.DESKTOP]: 18,
        [BREAKPOINTS.WIDE]: 15.8
    },
    SHOW_JOB_BREAKDOWN: {
        [BREAKPOINTS.MOBILE]: 21.5,
        [BREAKPOINTS.LANDSCAPE]: 22.4,
        [BREAKPOINTS.TABLET]: 19,
        [BREAKPOINTS.DESKTOP]: 19,
        [BREAKPOINTS.WIDE]: 16.5
    },
    HIDE_JOB_BREAKDOWN: {
        [BREAKPOINTS.MOBILE]: 23.5,
        [BREAKPOINTS.LANDSCAPE]: 23.25,
        [BREAKPOINTS.TABLET]: 20,
        [BREAKPOINTS.DESKTOP]: 19.75,
        [BREAKPOINTS.WIDE]: 17.75
    },
    COLLECT_PAGE: {
        [BREAKPOINTS.MOBILE]: 23.75,
        [BREAKPOINTS.LANDSCAPE]: 23.5,
        [BREAKPOINTS.TABLET]: 20.4,
        [BREAKPOINTS.DESKTOP]: 20,
        [BREAKPOINTS.WIDE]: 18
    },
    COLLECT_FILL: {
        [BREAKPOINTS.MOBILE]: 24,
        [BREAKPOINTS.LANDSCAPE]: 24.5,
        [BREAKPOINTS.TABLET]: 21,
        [BREAKPOINTS.DESKTOP]: 20.5,
        [BREAKPOINTS.WIDE]: 18.75
    }
};

    function handleScroll() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / windowHeight) * 100;
        console.log('Current scroll percentage:', scrollPercent.toFixed(2) + '%');

// Utility functions
const getViewportWidth = () => {
    try {
        return window.innerWidth;
    } catch (error) {
        console.error('Error getting viewport width:', error);
        return BREAKPOINTS.DESKTOP; // Fallback to desktop
    }
};

const getViewportBreakpoint = (width) => {
    if (width <= BREAKPOINTS.MOBILE) return BREAKPOINTS.MOBILE;
    if (width <= BREAKPOINTS.LANDSCAPE) return BREAKPOINTS.LANDSCAPE;
    if (width <= BREAKPOINTS.TABLET) return BREAKPOINTS.TABLET;
    if (width <= BREAKPOINTS.DESKTOP) return BREAKPOINTS.DESKTOP;
    return BREAKPOINTS.WIDE;
};

const getTriggerPoint = (action, viewport) => {
    try {
        return SCROLL_TRIGGERS[action][viewport] || SCROLL_TRIGGERS[action][BREAKPOINTS.DESKTOP];
    } catch (error) {
        console.error(`Error getting trigger point for ${action} at viewport ${viewport}:`, error);
        return SCROLL_TRIGGERS[action][BREAKPOINTS.DESKTOP]; // Fallback to desktop
    }
};


        // Scroll progress interaction begins
        // Job Send
const handleJobSend = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('JOB_SEND', viewport);
    
    if (scrollPercent >= triggerPoint) {
            secondScreen?.classList.remove('hide');
        } else {
            secondScreen?.classList.add('hide');
        }
};

      // Show Queue
      const handleShowQueue = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('SHOW_QUEUE', viewport);
    
    if (scrollPercent >= triggerPoint) {
        dimScreen?.classList.add('undim');
        queueModalBg?.classList.add('queued');
        queuedJobsWrap?.classList.add('queued');
        queueModal?.classList.add('hide');
        jobsEmpty?.classList.remove('hide');

        // Handle queue items visibility
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

        console.log(`Show Queue triggered at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        resetQueueState();
    }
};

const resetQueueState = () => {
    dimScreen?.classList.remove('undim');
    queueModalBg?.classList.remove('queued');
    queuedJobsWrap?.classList.remove('queued');
    queueModal?.classList.remove('hide');
    jobsEmpty?.classList.add('hide');

    for (let i = 1; i <= 5; i++) {
        const toQueue = document.querySelector(`#to-queue${i}`);
        const inQueue = document.querySelector(`#in-queue${i}`);
        toQueue?.classList.remove('hide');
        inQueue?.classList.add('hide');
    }

    const inQueue15 = document.querySelector('#in-queue15');
    const inQueue35 = document.querySelector('#in-queue35');
    inQueue15?.classList.add('hide');
    inQueue35?.classList.add('hide');
};

    // Job Route Ready
   const handleJobRouteReady = (scrollPercent, viewport) => {
      const triggerPoint = getTriggerPoint('JOB_ROUTE_READY', viewport);
        
        if (scrollPercent >= triggerPoint) {
            elements.queuedJobsWrap?.classList.add('ready');
            elements.jobsEmpty?.classList.add('hide');
            elements.queueModalBg?.classList.add('done'); 
        } else {
            elements.queuedJobsWrap?.classList.remove('ready');
            elements.queueModalBg?.classList.remove('done');
        }
   };

        // Job Route
        const queueItems = {
            inQueue1: document.querySelector('#in-queue1'),
            inQueue15: document.querySelector('#in-queue15'),
            inQueue2: document.querySelector('#in-queue2'),
            inQueue3: document.querySelector('#in-queue3'),
            inQueue35: document.querySelector('#in-queue35'),
            inQueue4: document.querySelector('#in-queue4'),
            inQueue5: document.querySelector('#in-queue5')
        };
      
     const handleJobRoute = (scrollPercent, viewport) => {
      const triggerPoint = getTriggerPoint('JOB_ROUTE', viewport);
        
        if (scrollPercent >= triggerPoint) {
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
     };

        // To Printers
        const baseimg3 = document.querySelector('#baseimg3');
        let baseimg3Listener = null;
     const handleToPrinters = (scrollPercent, viewport) => {
      const triggerPoint = getTriggerPoint('TO_PRINTERS', viewport);
        
        if (scrollPercent >= triggerPoint) {
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
     };
     
        // Start Job Static
        const baseimg4 = document.querySelector('#baseimg4');
        const progressWrapper = document.querySelector('.progress-bar-wrapper');
        
    const handleStartJobStatic = (scrollPercent, viewport) => {
       const triggerPoint = getTriggerPoint('START_JOB_STATIC', viewport);
        
        if (scrollPercent >= triggerPoint) {
            baseimg4?.classList.remove('hide');
            progressWrapper?.classList.remove('hide');
        } else {
            baseimg4?.classList.add('hide');
            progressWrapper?.classList.add('hide');          
        }
    };

// Start Job Fill
const baseimg5 = document.querySelector('#baseimg5');
const errorbar = document.querySelector('#p-med-2');
const med2Bar = document.querySelector('#p-med-2');
const errorpopup = document.querySelector('.error-popup-wrapper');
let errorTransitionListener = null;

const handleStartJobFill = (scrollPercent, viewport) => {
  const triggerPoint = getTriggerPoint('START_JOB_FILL', viewport);
        
    if (scrollPercent >= triggerPoint) {
    // Add fill classes to progress bars
    ['#p-slow-1', '#p-slow-2'].forEach(id => {
        document.querySelector(id)?.classList.add('fill-30');
    });
    
    ['#p-med-1', '#p-med-2'].forEach(id => {
        document.querySelector(id)?.classList.add('fill-60');
    });
    
    ['#p-fast-1', '#p-fast-2', '#p-fast-3', '#p-fast-4'].forEach(id => {
        document.querySelector(id)?.classList.add('fill-100');
    });

    // Only add the listener if it hasn't been added yet
    if (!errorTransitionListener) {
        errorTransitionListener = function showError() {
            setTimeout(() => {
                baseimg5?.classList.remove('hide');
                errorbar?.classList.add('error');
                // Wait for baseimg5 transition to complete before showing popup
                setTimeout(() => {
                    errorpopup?.classList.remove('hide');
                }, 400);
            }, 200);
            med2Bar?.removeEventListener('transitionend', errorTransitionListener);
            errorTransitionListener = null;
        };
        med2Bar?.addEventListener('transitionend', errorTransitionListener);
    }
} else if (scrollPercent < 18) {
     errorpopup?.classList.add('hide');
} else {
    // Remove fill classes from progress bars
    ['#p-slow-1', '#p-slow-2'].forEach(id => {
        document.querySelector(id)?.classList.remove('fill-30');
    });
    
    ['#p-med-1', '#p-med-2'].forEach(id => {
        document.querySelector(id)?.classList.remove('fill-60');
    });
    
    ['#p-fast-1', '#p-fast-2', '#p-fast-3', '#p-fast-4'].forEach(id => {
        document.querySelector(id)?.classList.remove('fill-100');
    });

    // Clean up by removing the listener if it exists
    if (errorTransitionListener) {
        med2Bar?.removeEventListener('transitionend', errorTransitionListener);
        errorTransitionListener = null;
    }

    // Hide error elements immediately when scrolling back
    baseimg5?.classList.add('hide');
    errorbar?.classList.remove('error');
    errorpopup?.classList.add('hide');
}
};

// hide baseimg5 <5%
   if (scrollPercent <12.5) {
     baseimg5?.classList.add('hide');
   }

// Fail Notif
        const errornotif = document.querySelector('.error-notif-wrapper');
      
const handleFailNotif = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('FAIL_NOTIF', viewport);
        
    if (scrollPercent >= triggerPoint) {
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
};

    // Queue Progress
    const baseimg6 = document.querySelector('#baseimg6');
    const jobProgress = document.querySelector('#job-progress');
    const jobProgPopup = document.querySelector('#progress-popup');
    const prog100 = document.querySelector('#p-100');
    const prog25 = document.querySelector('#p-25');

  const handleQueueProgress = (scrollPercent, viewport) => {
   const triggerPoint = getTriggerPoint('QUEUE_PROGRESS', viewport);
        
    if (scrollPercent >= triggerPoint) {
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
  };
    // Show & Hide Job Breakdown
    const handleShowHideJobBreakdown = (scrollPercent, viewport) => {
    const triggerPointStart = getTriggerPointStart('SHOW_JOB_BREAKDOWN', viewport)
    const triggerPointEnd = getTriggerPointEnd('HIDE_JOB_BREAKDOWN', viewport);
        
    if (scrollPercent >= triggerPointStart && scrollPercent < triggerPointEnd) {
         jobProgPopup?.classList.remove('hide');
     } else {
         jobProgPopup?.classList.add('hide');
     }
    };

    // Collect Page
    const baseimg7 = document.querySelector('#baseimg7');
    const toCollect = document.querySelector('#collect-wrap');
    const prodWrap = document.querySelector('#prod-wrap');

   const handleCollectPage = (scrollPercent, viewport) => {
   const triggerPoint = getTriggerPoint('COLLECT_PAGE', viewport);
        
    if (scrollPercent >= triggerPoint) {
      baseimg7?.classList.remove('hide');
      toCollect?.classList.remove('hide');
      prodWrap?.classList.add('hide');
    } else {
      baseimg7?.classList.add('hide');
      toCollect?.classList.add('hide');
      prodWrap?.classList.remove('hide');
    }    
    };

    // Collect Fill
    const col1 = document.querySelector('#c12');
    const col2 = document.querySelector('#c22');
    const col3 = document.querySelector('#c32');
    const col4 = document.querySelector('#c42');
    const j1 = document.querySelector('#j1');
    const j2 = document.querySelector('#j2');
    const j3 = document.querySelector('#j3');
    const j4 = document.querySelector('#j4');

  const handleCollectFill = (scrollPercent, viewport) => {
   const triggerPoint = getTriggerPoint('COLLECT_FILL', viewport);
        
    if (scrollPercent >= triggerPoint) {
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
 };
}


// Scroll progress interaction ends
    // Add scroll listener with debounce for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 10);
        }
    }, { passive: true });

    // Check initial scroll position
    handleScroll();
});
