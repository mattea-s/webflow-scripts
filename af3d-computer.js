// Immediately invoked function expression to control scope
(() => {
    // Debug utilities
    const Debug = {
        logElementState(elementName, element) {
            console.group(`${elementName} State Check:`);
            console.log('Element exists:', !!element);
            if (element) {
                console.log('Classes:', element.classList.toString());
                console.log('Display:', window.getComputedStyle(element).display);
                console.log('Opacity:', window.getComputedStyle(element).opacity);
                console.log('Transform:', window.getComputedStyle(element).transform);
            }
            console.groupEnd();
        },

        logStateTransition(action, scrollPercent, viewport) {
            console.group(`Animation State Update - ${action}`);
            console.log('Scroll Position:', scrollPercent.toFixed(2) + '%');
            console.log('Viewport:', viewport + 'px');
            console.log('Current State:', StateMachine.currentState);
            console.log('Can Transition:', StateMachine.canTransition());
            console.log('Time Since Last:', Date.now() - StateMachine.lastTransitionTime + 'ms');
            console.groupEnd();
        },

        logTransitionAttempt(from, to, success) {
            console.group('State Transition Attempt');
            console.log('From:', from);
            console.log('To:', to);
            console.log('Success:', success);
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
        }
    };

    // Constants
    const BREAKPOINTS = {
        MOBILE: 478,
        LANDSCAPE: 767,
        TABLET: 991,
        DESKTOP: 1439,
        WIDE: 1920
    };

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
    
    const SCROLL_TRIGGERS = {
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

    // Global state
    const AppState = {
        currentViewport: null,
        lastScrollPercent: 0,
        baseimg3Listener: null,
        errorTransitionListener: null,
        isInitialized: false
    };

    // Enhanced State Machine
    const StateMachine = {
        currentState: ANIMATION_STATES.INITIAL,
        lastTransitionTime: Date.now(),
        minimumTransitionTime: 400,
        
        canTransition() {
            const timeSinceLastTransition = Date.now() - this.lastTransitionTime;
            console.log('Time since last transition:', timeSinceLastTransition + 'ms');
            return timeSinceLastTransition >= this.minimumTransitionTime;
        },
        
        transition(newState) {
            if (this.currentState === newState) {
                console.log('Skipping transition - already in state:', newState);
                return false;
            }
            
            if (!this.canTransition()) {
                console.log('Transition blocked - minimum time not elapsed');
                return false;
            }
            
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
            
            if (!validTransitions[this.currentState]?.includes(newState)) {
                console.warn(`Invalid transition attempted from ${this.currentState} to ${newState}`);
                return false;
            }
            
            Debug.logTransitionAttempt(this.currentState, newState, true);
            this.currentState = newState;
            this.lastTransitionTime = Date.now();
            return true;
        }
    };
    
    // DOM Elements cache
    const ELEMENTS = {
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

    // Utility functions
    function getTriggerPoint(action, viewport) {
        try {
            return Math.round((SCROLL_TRIGGERS[action][viewport] || SCROLL_TRIGGERS[action][BREAKPOINTS.DESKTOP]) * 10000) / 10000;
        } catch (error) {
            console.error(`Error getting trigger point for ${action} at viewport ${viewport}:`, error);
            return SCROLL_TRIGGERS[action][BREAKPOINTS.DESKTOP];
        }
    }

    function getViewportWidth() {
        try {
            return window.innerWidth;
        } catch (error) {
            console.error('Error getting viewport width:', error);
            return BREAKPOINTS.DESKTOP;
        }
    }

    function getViewportBreakpoint(width) {
        if (width <= BREAKPOINTS.MOBILE) return BREAKPOINTS.MOBILE;
        if (width <= BREAKPOINTS.LANDSCAPE) return BREAKPOINTS.LANDSCAPE;
        if (width <= BREAKPOINTS.TABLET) return BREAKPOINTS.TABLET;
        if (width <= BREAKPOINTS.DESKTOP) return BREAKPOINTS.DESKTOP;
        return BREAKPOINTS.WIDE;
    }

    // Initialize elements
    function initializeElements() {
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

            AppState.isInitialized = true;
            console.log('Elements initialized successfully');
        } catch (error) {
            console.error('Error initializing elements:', error);
            AppState.isInitialized = false;
        }
    }

    // Enhanced event handlers
    function handleJobSend(scrollPercent, viewport) {
        const triggerPoint = getTriggerPoint('JOB_SEND', viewport);
        
        Debug.logStateTransition('JOB_SEND', scrollPercent, viewport);
        
        if (scrollPercent >= triggerPoint) {
            if (StateMachine.transition(ANIMATION_STATES.JOB_SEND)) {
                console.group('Job Send - Before Updates');
                Debug.logElementState('secondScreen', ELEMENTS.secondScreen);
                console.groupEnd();

                ELEMENTS.secondScreen?.classList.remove('hide');

                console.group('Job Send - After Updates');
                Debug.logElementState('secondScreen', ELEMENTS.secondScreen);
                console.groupEnd();
            }
        } else if (scrollPercent < triggerPoint) {
            if (StateMachine.isInState(ANIMATION_STATES.JOB_SEND)) {
                if (StateMachine.transition(ANIMATION_STATES.INITIAL)) {
                    console.group('Job Send Reverse - Before Updates');
                    Debug.logElementState('secondScreen', ELEMENTS.secondScreen);
                    console.groupEnd();

                    ELEMENTS.secondScreen?.classList.add('hide');

                    console.group('Job Send Reverse - After Updates');
                    Debug.logElementState('secondScreen', ELEMENTS.secondScreen);
                    console.groupEnd();
                }
            }
        }
    }

    function handleShowQueue(scrollPercent, viewport) {
        const triggerPoint = getTriggerPoint('SHOW_QUEUE', viewport);
        
        Debug.logStateTransition('SHOW_QUEUE', scrollPercent, viewport);
        
        if (scrollPercent >= triggerPoint) {
            if (StateMachine.isInState(ANIMATION_STATES.JOB_SEND) && 
                StateMachine.transition(ANIMATION_STATES.SHOW_QUEUE)) {
                
                console.group('Show Queue - Before Updates');
                Debug.logElementState('dimScreen', ELEMENTS.dimScreen);
                Debug.logElementState('queueModalBg', ELEMENTS.queueModalBg);
                Debug.logElementState('queuedJobsWrap', ELEMENTS.queuedJobsWrap);
                Debug.logElementState('queueModal', ELEMENTS.queueModal);
                Debug.logElementState('jobsEmpty', ELEMENTS.jobsEmpty);
                console.groupEnd();
                
                ELEMENTS.dimScreen?.classList.add('undim');
                ELEMENTS.queueModalBg?.classList.add('queued');
                ELEMENTS.queuedJobsWrap?.classList.add('queued');
                ELEMENTS.queueModal?.classList.add('hide');
                ELEMENTS.jobsEmpty?.classList.remove('hide');
                
                // Log queue item states
                console.group('Queue Items - Before Updates');
                for (let i = 1; i <= 5; i++) {
                    Debug.logElementState(`toQueue${i}`, document.querySelector(`#to-queue${i}`));
                    Debug.logElementState(`inQueue${i}`, document.querySelector(`#in-queue${i}`));
                }
                console.groupEnd();
                
                for (let i = 1; i <= 5; i++) {
                    const toQueue = document.querySelector(`#to-queue${i}`);
                    const inQueue = document.querySelector(`#in-queue${i}`);
                    toQueue?.classList.add('hide');
                    inQueue?.classList.remove('hide');
                }
                
                const inQueue15 = document.querySelector('#in-queue15');
                const inQueue35 = document.querySelector('#in-queue35');
                inQueue15?.classList.remove('hide');
                inQueue35?.classList.remove('hide');
                
                console.group('Show Queue - After Updates');
                Debug.logElementState('dimScreen', ELEMENTS.dimScreen);
                Debug.logElementState('queueModalBg', ELEMENTS.queueModalBg);
                Debug.logElementState('queuedJobsWrap', ELEMENTS.queuedJobsWrap);
                Debug.logElementState('queueModal', ELEMENTS.queueModal);
                Debug.logElementState('jobsEmpty', ELEMENTS.jobsEmpty);
                console.groupEnd();
            }
        } else if (scrollPercent < triggerPoint) {
            if (StateMachine.isInState(ANIMATION_STATES.SHOW_QUEUE)) {
                if (StateMachine.transition(ANIMATION_STATES.JOB_SEND)) {
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
                }
            }
        }
    }

    // Enhanced scroll handler
    function handleScroll() {
        if (!AppState.isInitialized) {
            console.warn('Elements not initialized. Initializing now...');
            initializeElements();
            if (!AppState.isInitialized) {
                console.error('Failed to initialize elements');
                return;
            }
        }

        try {
            const viewport = getViewportWidth();
            const breakpoint = getViewportBreakpoint(viewport);
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (window.scrollY / windowHeight) * 100;

            console.group('Scroll Update');
            console.log('Viewport:', viewport);
            console.log('Breakpoint:', breakpoint);
            console.log('Window Height:', windowHeight);
            console.log('Scroll Percent:', scrollPercent.toFixed(2) + '%');
            console.groupEnd();

            if (AppState.currentViewport !== breakpoint) {
                AppState.currentViewport = breakpoint;
                console.log('Viewport breakpoint changed to:', breakpoint);
            }

            handleJobSend(scrollPercent, breakpoint);
            handleShowQueue(scrollPercent, breakpoint);

            AppState.lastScrollPercent = scrollPercent;
        } catch (error) {
            console.error('Error in scroll handler:', error);
            console.error('Stack:', error.stack);
        }
    }

    // Initialize with enhanced logging
    window.Webflow = window.Webflow || [];
    window.Webflow.push(() => {
        console.group('Initialization');
        console.log('Starting initialization...');
        initializeElements();
        
        let scrollTimeout;
        let lastScrollTime = Date.now();
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            const now = Date.now();
            
            if (now - lastScrollTime < 16) {
                return;
            }
            
            lastScrollTime = now;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (!scrollTimeout) {
                        scrollTimeout = setTimeout(() => {
                            handleScroll();
                            scrollTimeout = null;
                            ticking = false;
                        }, 16);
                    }
                });
                ticking = true;
            }
        }, { passive: true });

        handleScroll();
        console.log('Initialization complete');
        console.groupEnd();
    });
})();
