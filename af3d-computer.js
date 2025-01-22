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
    },
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
    }
};

// Cache DOM elements for better performance
const ELEMENTS = {
    errorNotif: null,
    baseimg6: null,
    baseimg7: null,
    jobProgress: null,
    jobProgPopup: null,
    toCollect: null,
    prodWrap: null,
    progressElements: {
        prog100: null,
        prog25: null,
        prog50: [],
        prog10: []
    },
    collectElements: {
        columns: [],
        jobs: []
    },
    firstScreen: null,
    secondScreen: null,
    dimScreen: null,
    queueModalBg: null,
    queuedJobsWrap: null,
    queueModal: null,
    jobsEmpty: null,
    baseimg3: null,
    baseimg4: null,
    baseimg5: null,
    progressWrapper: null,
    errorbar: null,
    errorpopup: null,
    progressBars: {
        slow: [],
        med: [],
        fast: []
    }
};

// State machine constants
const ANIMATION_STATES = {
    INITIAL: 'initial',
    JOB_SEND: 'jobSend',
    SHOW_QUEUE: 'showQueue',
    JOB_ROUTE_READY: 'jobRouteReady',
    JOB_ROUTE: 'jobRoute',
    TO_PRINTERS: 'toPrinters',
    START_JOB_STATIC: 'startJobStatic',
    START_JOB_FILL: 'startJobFill'
};

// State machine
const StateMachine = {
    currentState: ANIMATION_STATES.INITIAL,
    lastTransitionTime: Date.now(),
    minimumTransitionTime: 400, // Match CSS transition duration
    
    canTransition() {
        return Date.now() - this.lastTransitionTime >= this.minimumTransitionTime;
    },
    
    transition(newState) {
        if (this.currentState === newState || !this.canTransition()) {
            return false;
        }
        
        // Define valid transitions
        const validTransitions = {
            [ANIMATION_STATES.INITIAL]: [ANIMATION_STATES.JOB_SEND],
            [ANIMATION_STATES.JOB_SEND]: [ANIMATION_STATES.INITIAL, ANIMATION_STATES.SHOW_QUEUE],
            [ANIMATION_STATES.SHOW_QUEUE]: [ANIMATION_STATES.JOB_SEND, ANIMATION_STATES.JOB_ROUTE_READY],
            [ANIMATION_STATES.JOB_ROUTE_READY]: [ANIMATION_STATES.SHOW_QUEUE, ANIMATION_STATES.JOB_ROUTE],
            [ANIMATION_STATES.JOB_ROUTE]: [ANIMATION_STATES.JOB_ROUTE_READY, ANIMATION_STATES.TO_PRINTERS],
            [ANIMATION_STATES.TO_PRINTERS]: [ANIMATION_STATES.JOB_ROUTE, ANIMATION_STATES.START_JOB_STATIC],
            [ANIMATION_STATES.START_JOB_STATIC]: [ANIMATION_STATES.TO_PRINTERS, ANIMATION_STATES.START_JOB_FILL],
            [ANIMATION_STATES.START_JOB_FILL]: [ANIMATION_STATES.START_JOB_STATIC]
        };
        
        // Check if transition is valid
        if (!validTransitions[this.currentState]?.includes(newState)) {
            console.log(`Invalid transition from ${this.currentState} to ${newState}`);
            return false;
        }
        
        console.log(`Transitioning from ${this.currentState} to ${newState}`);
        this.currentState = newState;
        this.lastTransitionTime = Date.now();
        return true;
    },
    
    // Helper to check if we're in a specific state
    isInState(state) {
        return this.currentState === state;
    }
};
};

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

// DOM element initialization
const initializeElements = () => {
    try {
        ELEMENTS.firstScreen = document.querySelector('.first-screen');
        ELEMENTS.secondScreen = document.querySelector('.second-screen');
        ELEMENTS.dimScreen = document.querySelector('.dim-screen');
        ELEMENTS.queueModalBg = document.querySelector('.queue-modal-background');
        ELEMENTS.queuedJobsWrap = document.querySelector('.queued-jobs-wrap');
        ELEMENTS.queueModal = document.querySelector('#queue-modal');
        ELEMENTS.jobsEmpty = document.querySelector('#jobs-empty');
        ELEMENTS.baseimg3 = document.querySelector('#baseimg3');
        ELEMENTS.baseimg4 = document.querySelector('#baseimg4');
        ELEMENTS.baseimg5 = document.querySelector('#baseimg5');
        ELEMENTS.progressWrapper = document.querySelector('.progress-bar-wrapper');
        ELEMENTS.errorbar = document.querySelector('#p-med-2');
        ELEMENTS.errorpopup = document.querySelector('.error-popup-wrapper');

        // Initialize progress bars
        ELEMENTS.progressBars.slow = [
            document.querySelector('#p-slow-1'),
            document.querySelector('#p-slow-2')
        ];
        ELEMENTS.progressBars.med = [
            document.querySelector('#p-med-1'),
            document.querySelector('#p-med-2')
        ];
        ELEMENTS.progressBars.fast = [
            document.querySelector('#p-fast-1'),
            document.querySelector('#p-fast-2'),
            document.querySelector('#p-fast-3'),
            document.querySelector('#p-fast-4')
        ];

        // Initialize additional elements
        ELEMENTS.errorNotif = document.querySelector('.error-notif-wrapper');
        ELEMENTS.baseimg6 = document.querySelector('#baseimg6');
        ELEMENTS.baseimg7 = document.querySelector('#baseimg7');
        ELEMENTS.jobProgress = document.querySelector('#job-progress');
        ELEMENTS.jobProgPopup = document.querySelector('#progress-popup');
        ELEMENTS.toCollect = document.querySelector('#collect-wrap');
        ELEMENTS.prodWrap = document.querySelector('#prod-wrap');

        // Initialize progress elements
        ELEMENTS.progressElements.prog100 = document.querySelector('#p-100');
        ELEMENTS.progressElements.prog25 = document.querySelector('#p-25');
        ELEMENTS.progressElements.prog50 = [
            document.querySelector('#p-50'),
            document.querySelector('#d-50-1'),
            document.querySelector('#d-50-2')
        ];
        ELEMENTS.progressElements.prog10 = [
            document.querySelector('#d-10'),
            document.querySelector('#p-10')
        ];

        // Initialize collect elements
        ELEMENTS.collectElements.columns = [
            document.querySelector('#c12'),
            document.querySelector('#c22'),
            document.querySelector('#c32'),
            document.querySelector('#c42')
        ];
        ELEMENTS.collectElements.jobs = [
            document.querySelector('#j1'),
            document.querySelector('#j2'),
            document.querySelector('#j3'),
            document.querySelector('#j4')
        ];

        state.isInitialized = true;
        console.log('Elements initialized successfully');
    } catch (error) {
        console.error('Error initializing elements:', error);
        state.isInitialized = false;
    }
};

// Scroll handler functions
const handleJobSend = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('JOB_SEND', viewport);
    
    if (scrollPercent >= triggerPoint) {
        // Only trigger if we can transition to JOB_SEND state
        if (StateMachine.transition(ANIMATION_STATES.JOB_SEND)) {
            ELEMENTS.secondScreen?.classList.remove('hide');
            console.log(`Job Send triggered at ${scrollPercent}% (viewport: ${viewport}px)`);
        }
    } else if (scrollPercent < triggerPoint) {
        // Only revert if we're currently in JOB_SEND state
        if (StateMachine.isInState(ANIMATION_STATES.JOB_SEND)) {
            if (StateMachine.transition(ANIMATION_STATES.INITIAL)) {
                ELEMENTS.secondScreen?.classList.add('hide');
            }
        }
    }
};

const handleShowQueue = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('SHOW_QUEUE', viewport);
    
    if (scrollPercent >= triggerPoint) {
        // Only proceed if we're in JOB_SEND state and can transition
        if (StateMachine.isInState(ANIMATION_STATES.JOB_SEND) && 
            StateMachine.transition(ANIMATION_STATES.SHOW_QUEUE)) {
            
            ELEMENTS.dimScreen?.classList.add('undim');
            ELEMENTS.queueModalBg?.classList.add('queued');
            ELEMENTS.queuedJobsWrap?.classList.add('queued');
            ELEMENTS.queueModal?.classList.add('hide');
            ELEMENTS.jobsEmpty?.classList.remove('hide');
            
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
        }
    } else if (scrollPercent < triggerPoint) {
        // Only revert if we're in SHOW_QUEUE state
        if (StateMachine.isInState(ANIMATION_STATES.SHOW_QUEUE)) {
            if (StateMachine.transition(ANIMATION_STATES.JOB_SEND)) {
                resetQueueState();
            }
        }
    }
};

const resetQueueState = () => {
    ELEMENTS.dimScreen?.classList.remove('undim');
    ELEMENTS.queueModalBg?.classList.remove('queued');
    ELEMENTS.queuedJobsWrap?.classList.remove('queued');
    ELEMENTS.queueModal?.classList.remove('hide');
    ELEMENTS.jobsEmpty?.classList.add('hide');

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

const handleStartJobFill = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('START_JOB_FILL', viewport);
    
    if (scrollPercent >= triggerPoint) {
        // Add fill classes to progress bars
        ELEMENTS.progressBars.slow.forEach(bar => bar?.classList.add('fill-30'));
        ELEMENTS.progressBars.med.forEach(bar => bar?.classList.add('fill-60'));
        ELEMENTS.progressBars.fast.forEach(bar => bar?.classList.add('fill-100'));

        if (!state.errorTransitionListener) {
            state.errorTransitionListener = function showError() {
                setTimeout(() => {
                    ELEMENTS.baseimg5?.classList.remove('hide');
                    ELEMENTS.errorbar?.classList.add('error');
                    setTimeout(() => {
                        ELEMENTS.errorpopup?.classList.remove('hide');
                    }, 400);
                }, 200);
                
                ELEMENTS.errorbar?.removeEventListener('transitionend', state.errorTransitionListener);
                state.errorTransitionListener = null;
            };
            
            ELEMENTS.errorbar?.addEventListener('transitionend', state.errorTransitionListener);
        }
        
        console.log(`Start Job Fill triggered at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        resetJobFillState();
    }
};

// Handle fail notification
const handleFailNotif = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('FAIL_NOTIF', viewport);
    const hidePoint = getTriggerPoint('QUEUE_PROGRESS', viewport);
    
    if (scrollPercent >= triggerPoint && scrollPercent < hidePoint) {
        ELEMENTS.errorNotif?.classList.remove('hide');
        setTimeout(() => {
            ELEMENTS.errorNotif?.classList.add('alert');
        }, 100);
        console.log(`Fail notification shown at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        ELEMENTS.errorNotif?.classList.remove('alert');
        setTimeout(() => {
            ELEMENTS.errorNotif?.classList.add('hide');
        }, 100);
    }
};

// Handle queue progress
const handleQueueProgress = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('QUEUE_PROGRESS', viewport);
    
    if (scrollPercent >= triggerPoint) {
        ELEMENTS.baseimg6?.classList.remove('hide');
        ELEMENTS.jobProgress?.classList.remove('hide');
        
        setTimeout(() => {
            ELEMENTS.progressElements.prog50.forEach(el => el?.classList.add('prog-50'));
            ELEMENTS.progressElements.prog10.forEach(el => el?.classList.add('prog-10'));
            ELEMENTS.progressElements.prog100?.classList.add('prog-100');
            ELEMENTS.progressElements.prog25?.classList.add('prog-25');
        }, 100);
        
        console.log(`Queue progress started at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        resetQueueProgressState();
    }
};

const resetQueueProgressState = () => {
    ELEMENTS.progressElements.prog50.forEach(el => el?.classList.remove('prog-50'));
    ELEMENTS.progressElements.prog10.forEach(el => el?.classList.remove('prog-10'));
    ELEMENTS.progressElements.prog100?.classList.remove('prog-100');
    ELEMENTS.progressElements.prog25?.classList.remove('prog-25');
    
    ELEMENTS.baseimg6?.classList.add('hide');
    ELEMENTS.jobProgress?.classList.add('hide');
    ELEMENTS.jobProgPopup?.classList.add('hide');
};

// Handle job breakdown visibility
const handleJobBreakdown = (scrollPercent, viewport) => {
    const showPoint = getTriggerPoint('SHOW_JOB_BREAKDOWN', viewport);
    const hidePoint = getTriggerPoint('HIDE_JOB_BREAKDOWN', viewport);
    
    if (scrollPercent >= showPoint && scrollPercent < hidePoint) {
        ELEMENTS.jobProgPopup?.classList.remove('hide');
        console.log(`Job breakdown shown at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        ELEMENTS.jobProgPopup?.classList.add('hide');
    }
};

// Handle collect page
const handleCollectPage = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('COLLECT_PAGE', viewport);
    
    if (scrollPercent >= triggerPoint) {
        ELEMENTS.baseimg7?.classList.remove('hide');
        ELEMENTS.toCollect?.classList.remove('hide');
        ELEMENTS.prodWrap?.classList.add('hide');
        console.log(`Collect page shown at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        ELEMENTS.baseimg7?.classList.add('hide');
        ELEMENTS.toCollect?.classList.add('hide');
        ELEMENTS.prodWrap?.classList.remove('hide');
    }
};

// Handle collect fill
const handleCollectFill = (scrollPercent, viewport) => {
    const triggerPoint = getTriggerPoint('COLLECT_FILL', viewport);
    
    if (scrollPercent >= triggerPoint) {
        // Sequence of animations with delays
        setTimeout(() => {
            ELEMENTS.collectElements.columns[0]?.classList.add('col-50');
        }, 100);
        
        setTimeout(() => {
            ELEMENTS.collectElements.jobs[0]?.classList.add('hide');
            ELEMENTS.collectElements.columns[1]?.classList.add('col-50');
        }, 900);
        
        setTimeout(() => {
            ELEMENTS.collectElements.jobs[1]?.classList.add('hide');
            ELEMENTS.collectElements.columns[2]?.classList.add('col-10');
        }, 1700);
        
        setTimeout(() => {
            ELEMENTS.collectElements.jobs[2]?.classList.add('hide');
            ELEMENTS.collectElements.columns[3]?.classList.add('col-25');
        }, 2500);
        
        setTimeout(() => {
            ELEMENTS.collectElements.jobs[3]?.classList.add('hide');
        }, 3300);
        
        console.log(`Collect fill started at ${scrollPercent}% (viewport: ${viewport}px)`);
    } else {
        resetCollectFillState();
    }
};

const resetCollectFillState = () => {
    ELEMENTS.collectElements.columns.forEach(col => col?.classList.remove('col-50', 'col-10', 'col-25'));
    ELEMENTS.collectElements.jobs.forEach(job => job?.classList.remove('hide'));
};

const resetJobFillState = () => {
    ELEMENTS.progressBars.slow.forEach(bar => bar?.classList.remove('fill-30'));
    ELEMENTS.progressBars.med.forEach(bar => bar?.classList.remove('fill-60'));
    ELEMENTS.progressBars.fast.forEach(bar => bar?.classList.remove('fill-100'));

    if (state.errorTransitionListener) {
        ELEMENTS.errorbar?.removeEventListener('transitionend', state.errorTransitionListener);
        state.errorTransitionListener = null;
    }

    ELEMENTS.baseimg5?.classList.add('hide');
    ELEMENTS.errorbar?.classList.remove('error');
    ELEMENTS.errorpopup?.classList.add('hide');
};

// Main scroll handler
const handleScroll = () => {
    if (!state.isInitialized) {
        console.warn('Elements not initialized. Initializing now...');
        initializeElements();
        if (!state.isInitialized) return;
    }

    // Track previous state for transition management
    const prevState = {
        isJobSend: state.isJobSend,
        isShowQueue: state.isShowQueue,
        isJobFill: state.isJobFill
    };

    try {
        const viewport = getViewportWidth();
        const breakpoint = getViewportBreakpoint(viewport);
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / windowHeight) * 100;

        // Update viewport if changed
        if (state.currentViewport !== breakpoint) {
            state.currentViewport = breakpoint;
            console.log(`Viewport changed to ${breakpoint}px`);
        }

        // Handle all scroll-based interactions
        handleJobSend(scrollPercent, breakpoint);
        handleShowQueue(scrollPercent, breakpoint);
        handleStartJobFill(scrollPercent, breakpoint);
        handleFailNotif(scrollPercent, breakpoint);
        handleQueueProgress(scrollPercent, breakpoint);
        handleJobBreakdown(scrollPercent, breakpoint);
        handleCollectPage(scrollPercent, breakpoint);
        handleCollectFill(scrollPercent, breakpoint);

        state.lastScrollPercent = scrollPercent;
    } catch (error) {
        console.error('Error in scroll handler:', error);
    }
};

// Initialize
window.Webflow = window.Webflow || [];
window.Webflow.push(() => {
    console.log('Initializing scroll handler...');
    initializeElements();
    
    // Add scroll listener with debounce
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
