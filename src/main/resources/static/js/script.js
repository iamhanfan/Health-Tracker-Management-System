document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION & CORE UTILITIES ---
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const messageEl = document.getElementById('message');
    const token = localStorage.getItem('jwtToken');

    const showMessage = (message, isError = true) => {
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = isError ? 'message error' : 'message success';
        }
    };

    const protectedPages = ['/dashboard.html', '/workouts.html', '/meals.html', '/goals.html', '/progress.html'];
    if (protectedPages.includes(window.location.pathname) && !token) {
        window.location.href = '/login.html';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('jwtToken', data.accessToken);
                    window.location.href = '/dashboard.html';
                } else {
                    showMessage('Login failed. Please check your credentials.');
                }
            } catch (error) {
                showMessage('An error occurred during login.');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const age = document.getElementById('age').value;
            const description = document.getElementById('description').value;
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, age, description }),
                });
                if (response.ok) {
                    showMessage('Sign up successful! Please log in.', false);
                    setTimeout(() => window.location.href = '/login.html', 2000);
                } else {
                    const errorText = await response.text();
                    showMessage(`Sign up failed: ${errorText}`);
                }
            } catch (error) {
                showMessage('An error occurred during sign up.');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login.html';
        });
    }

    // --- GENERIC API HELPERS ---
    const fetchData = async (endpoint, renderFunction) => {
        try {
            const response = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) window.location.href = '/login.html';
                throw new Error('Failed to fetch data.');
            }
            const data = await response.json();
            renderFunction(data);
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
        }
    };

    const postData = async (endpoint, formData, fetchAndRender) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                showMessage('Entry added successfully!', false);
                fetchAndRender();
            } else {
                showMessage('Failed to add entry.');
            }
        } catch (error) {
            showMessage('An error occurred.');
        }
    };

    // --- DASHBOARD PAGE LOGIC ---
    if (window.location.pathname.endsWith('/dashboard.html')) {
        const monthYearEl = document.getElementById('month-year');
        const weekViewEl = document.getElementById('week-view');
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');

        let selectedDate = new Date();

        const formatDateForApi = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const loadDashboardData = async (date) => {
            const formattedDate = formatDateForApi(date);
            try {
                const response = await fetch(`/api/dashboard/summary?date=${formattedDate}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                if (!response.ok) throw new Error('Failed to fetch dashboard data');
                const data = await response.json();
                populateDashboard(data);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        };
        
        const renderWeek = () => {
            weekViewEl.innerHTML = '';
            monthYearEl.textContent = `${selectedDate.toLocaleString('default', { month: 'long' })} ${selectedDate.getFullYear()}`;
            let startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            for (let i = 0; i < 7; i++) {
                let day = new Date(startOfWeek);
                day.setDate(day.getDate() + i);
                const dayItem = document.createElement('li');
                dayItem.classList.add('day');
                dayItem.dataset.date = day.toISOString();
                if (day.toDateString() === selectedDate.toDateString()) {
                    dayItem.classList.add('selected');
                }
                dayItem.innerHTML = `<span class="day-initial">${day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span><span class="day-number">${String(day.getDate()).padStart(2, '0')}</span>`;
                weekViewEl.appendChild(dayItem);
            }
        };

        const updateDashboardForDate = (date) => {
            selectedDate = date;
            renderWeek();
            loadDashboardData(date);
        };

        weekViewEl.addEventListener('click', (e) => {
            const selectedDayEl = e.target.closest('.day');
            if (!selectedDayEl) return;
            updateDashboardForDate(new Date(selectedDayEl.dataset.date));
        });

        prevWeekBtn.addEventListener('click', () => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            updateDashboardForDate(newDate);
        });

        nextWeekBtn.addEventListener('click', () => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            updateDashboardForDate(newDate);
        });

        const populateDashboard = (data) => {
            const updateCardValue = (cardSectionSelector, value, fallback = '0') => {
                const cardCountEl = document.querySelector(`${cardSectionSelector} + .card-count`);
                if (cardCountEl) {
                    const unitSpan = cardCountEl.querySelector('span');
                    const unitHtml = unitSpan ? unitSpan.outerHTML : '';
                    const displayValue = (value !== null && value !== undefined) ? value : fallback;
                    cardCountEl.innerHTML = `${displayValue} ${unitHtml}`;
                }
            };

            const updateText = (selector, text, fallback = '') => {
                const el = document.querySelector(selector);
                if (el) el.textContent = text || fallback;
            };

            // User Profile Section
            updateText('.profile-name', data.username, 'User');
            updateText('.profile-age', data.age ? `${data.age} years old` : 'Age not set');
            updateText('.profile-description', data.description, 'No description provided.');
            updateText('.tag-workout', data.profileTag1);
            updateText('.tag-frequency', data.profileTag2);
            const profilePic = document.getElementById('profilePic');
            if (profilePic) {
                profilePic.src = data.profileImageUrl || '/images/default-avatar.png';
            }

            // Update cards using the corrected helper function
            updateCardValue('.calorie-section', data.totalCaloriesBurnt);
            updateCardValue('.distance-section', data.totalDistanceCovered.toFixed(1));
            updateCardValue('.swimming-section', data.totalSwimmingDistance);
            updateCardValue('.water-section', data.todayWaterIntake);
            updateCardValue('.weightlift-section', data.totalWeightliftingMinutes);
            updateCardValue('.running-section', data.totalRunningMinutes);

            // Sleep Section
            if (data.latestSleepLog) {
                updateCardValue('.hours-section', data.latestSleepLog.totalHoursSleep.toFixed(1));
                updateCardValue('.bedtime-section', data.latestSleepLog.timeInBed.toFixed(1));
                updateCardValue('.rest-section', data.latestSleepLog.restfulnessPercentage);
                updateCardValue('.heart-section', data.latestSleepLog.restingHeartRate);
            } else {
                updateCardValue('.hours-section', 'N/A', '');
                updateCardValue('.bedtime-section', 'N/A', '');
                updateCardValue('.rest-section', 'N/A', '');
                updateCardValue('.heart-section', 'N/A', '');
            }
            
            // Steps Card
            const stepsGoal = 10000;
            updateText('.steps-section .chart-number', data.todaySteps);
            updateProgressCircle('.steps-section .progress-ring__circle', data.todaySteps, stepsGoal);
            
            // Cycle Statistics
            if (data.latestCycleMetric) {
                updateText('.period-section .chart-number', data.latestCycleMetric.periodLength);
                updateProgressCircle('.period-section .progress-ring__circle', data.latestCycleMetric.periodLength, 7);
                
                updateText('.variation-section .chart-number', data.latestCycleMetric.cycleVariation);
                updateProgressCircle('.variation-section .progress-ring__circle', data.latestCycleMetric.cycleVariation, 5);
                
                updateText('.length-section .chart-number', data.latestCycleMetric.cycleLength);
                updateProgressCircle('.length-section .progress-ring__circle', data.latestCycleMetric.cycleLength, 30);
            }
        };
        
        const updateProgressCircle = (selector, value, goal) => {
            const circle = document.querySelector(selector);
            if (!circle) return;
            const radius = circle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const progress = goal > 0 ? value / goal : 0;
            const offset = circumference - (Math.min(progress, 1)) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        };
        
        const profileImageUpload = document.getElementById('profileImageUpload');
        if (profileImageUpload) {
            profileImageUpload.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const response = await fetch('/api/profile/upload-image', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                    if (response.ok) {
                        const newImageUrl = await response.text();
                        document.getElementById('profilePic').src = newImageUrl;
                        alert('Profile image updated successfully!');
                    } else {
                        alert('Failed to upload image. Please try again.');
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('An error occurred while uploading the image.');
                }
            });
        }

        // Initial Load
        updateDashboardForDate(new Date());
    }

    // --- OTHER PAGES (WORKOUTS, MEALS, ETC.) ---
    
	if (window.location.pathname.endsWith('/workouts.html')) {
	        const workoutForm = document.getElementById('workoutForm');
	        const workoutList = document.getElementById('workoutList');
	        
	        // --- 1. Timer Logic ---
	        let hours = 0;
	        let minutes = 30;

	        const updateTimeUI = () => {
	            document.getElementById('hour-val').innerText = hours.toString().padStart(2, '0');
	            document.getElementById('min-val').innerText = minutes.toString().padStart(2, '0');
	        };

	        const setTimerActive = (type) => {
	            const hourGroup = document.getElementById('hour-group');
	            const minGroup = document.getElementById('min-group');
	            const labelEl = document.getElementById('unit-label');

	            if (type === 'hour') {
	                hourGroup.classList.add('active');
	                minGroup.classList.remove('active');
	                labelEl.innerText = "Hr";
	            } else {
	                minGroup.classList.add('active');
	                hourGroup.classList.remove('active');
	                labelEl.innerText = "Min";
	            }
	        };

	        // Attach click listeners to Timer components
	        document.getElementById('hour-group').addEventListener('click', () => setTimerActive('hour'));
	        document.getElementById('min-group').addEventListener('click', () => setTimerActive('min'));

	        document.getElementById('timer-hr-up').addEventListener('click', () => {
	            hours = (hours + 1) % 24;
	            setTimerActive('hour');
	            updateTimeUI();
	        });
	        document.getElementById('timer-hr-down').addEventListener('click', () => {
	            hours = (hours - 1 + 24) % 24;
	            setTimerActive('hour');
	            updateTimeUI();
	        });
	        document.getElementById('timer-min-up').addEventListener('click', () => {
	            minutes = (minutes + 1) % 60;
	            setTimerActive('min');
	            updateTimeUI();
	        });
	        document.getElementById('timer-min-down').addEventListener('click', () => {
	            minutes = (minutes - 1 + 60) % 60;
	            setTimerActive('min');
	            updateTimeUI();
	        });

	        updateTimeUI();

	        // --- 2. Calorie Widget Logic (Hold to change) ---
	        const plusBtn = document.getElementById('calorie-plus');
	        const minusBtn = document.getElementById('calorie-minus');
	        const progressFill = document.getElementById('calorie-progress-fill');
	        const calorieDisplay = document.getElementById('calorie-display');
	        
	        const maxCalories = 3000;
	        const minCalories = 0;
	        let currentCalories = 150;
	        const step = 10;

	        const updateCaloriesUI = () => {
	            calorieDisplay.innerHTML = `<span class="value">${currentCalories}</span> <span class="unit">kcal</span>`;
	            const progressPercentage = (currentCalories / maxCalories) * 100;
	            progressFill.style.width = `${progressPercentage}%`;
	        };

	        const addHoldFunctionality = (button, action, delay = 400, speed = 50) => {
	            let timerId, intervalId;
	            const stopActions = () => { clearTimeout(timerId); clearInterval(intervalId); };
	            const startActions = (e) => {
	                e.preventDefault();
	                action();
	                timerId = setTimeout(() => { intervalId = setInterval(action, speed); }, delay);
	            };
	            button.addEventListener('mousedown', startActions);
	            button.addEventListener('touchstart', startActions, { passive: false });
	            button.addEventListener('mouseup', stopActions);
	            button.addEventListener('mouseleave', stopActions);
	            button.addEventListener('touchend', stopActions);
	        };

	        addHoldFunctionality(plusBtn, () => {
	            if (currentCalories < maxCalories) {
	                currentCalories = Math.min(maxCalories, currentCalories + step);
	                updateCaloriesUI();
	            }
	        });

	        addHoldFunctionality(minusBtn, () => {
	            if (currentCalories > minCalories) {
	                currentCalories = Math.max(minCalories, currentCalories - step);
	                updateCaloriesUI();
	            }
	        });
	        updateCaloriesUI();

	        // --- 3. Calendar Logic ---
	        const monthYearEl = document.getElementById('month-year');
	        const weekViewEl = document.getElementById('week-view');
	        const prevWeekBtn = document.getElementById('prev-week');
	        const nextWeekBtn = document.getElementById('next-week');
	        let calendarDate = new Date();

	        const renderWeek = () => {
	            weekViewEl.innerHTML = '';
	            monthYearEl.textContent = `${calendarDate.toLocaleString('default', { month: 'long' })} ${calendarDate.getFullYear()}`;
	            let startOfWeek = new Date(calendarDate);
	            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
	            for (let i = 0; i < 7; i++) {
	                let day = new Date(startOfWeek);
	                day.setDate(day.getDate() + i);
	                const dayItem = document.createElement('li');
	                dayItem.classList.add('day');
	                dayItem.dataset.date = day.toISOString().split('T')[0];
	                if (day.toDateString() === new Date().toDateString()) {
	                     // Optional: Auto-select today if no explicit selection made
	                     dayItem.classList.add('selected');
	                }
	                dayItem.innerHTML = `<span class="day-initial">${day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span><span class="day-number">${day.getDate()}</span>`;
	                weekViewEl.appendChild(dayItem);
	            }
	        };
	        
	        weekViewEl.addEventListener('click', (e) => {
	            const selectedDayEl = e.target.closest('.day');
	            if (!selectedDayEl) return;
	            const previouslySelected = weekViewEl.querySelector('.selected');
	            if (previouslySelected) previouslySelected.classList.remove('selected');
	            selectedDayEl.classList.add('selected');
	        });

	        prevWeekBtn.addEventListener('click', (e) => { e.preventDefault(); calendarDate.setDate(calendarDate.getDate() - 7); renderWeek(); });
	        nextWeekBtn.addEventListener('click', (e) => { e.preventDefault(); calendarDate.setDate(calendarDate.getDate() + 7); renderWeek(); });
	        renderWeek();

	        // --- 4. Submission Logic ---
	        const renderWorkouts = (workouts) => {
	            workoutList.innerHTML = `<table><thead><tr><th>Type</th><th>Duration (min)</th><th>Calories Burned</th><th>Date</th></tr></thead><tbody>${workouts.map(w => `<tr><td>${w.type}</td><td>${w.durationMinutes}</td><td>${w.caloriesBurned}</td><td>${w.date}</td></tr>`).join('')}</tbody></table>`;
	        };
	        const fetchAndRenderWorkouts = () => fetchData('/api/workouts', renderWorkouts);
	        
	        workoutForm.addEventListener('submit', (e) => {
	            e.preventDefault();
	            const type = document.getElementById('type').value;
	            const selectedDayEl = document.querySelector('#week-view .day.selected');
	            
	            if (!selectedDayEl) { alert("Please select a date."); return; }
	            
	            // Calculate total minutes
	            const totalMinutes = (hours * 60) + minutes;
	            if (totalMinutes === 0) { alert("Duration cannot be 0."); return; }

	            const formData = { 
	                type: type, 
	                durationMinutes: totalMinutes, 
	                caloriesBurned: currentCalories, 
	                date: selectedDayEl.dataset.date 
	            };
	            postData('/api/workouts', formData, fetchAndRenderWorkouts);
	            
	            // Reset form UI if needed
	            document.getElementById('type').value = "";
	        });
	        fetchAndRenderWorkouts();
	    }
    
	if (window.location.pathname.endsWith('/meals.html')) {
	        const mealForm = document.getElementById('mealForm');
	        const mealList = document.getElementById('mealList');
	        
	        // --- Widget & Button State Management ---
	        const mealBtnSection = document.querySelector('.meal-btn-section');
	        const plusBtn = document.getElementById('calorie-plus');
	        const minusBtn = document.getElementById('calorie-minus');
	        const progressFill = document.getElementById('calorie-progress-fill');
	        const calorieDisplay = document.getElementById('calorie-display');
	            
	        let selectedMealType = 'Breakfast';
	        let currentCalories = 150;
	        const maxCalories = 3000;
	        const minCalories = 0;
	        const step = 10;

	        document.getElementById('breakfast-btn').style.backgroundColor = 'rgb(255, 206, 100)';

	        const addHoldFunctionality = (button, action, delay = 400, speed = 50) => {
	            let timerId, intervalId;
	            const stopActions = () => { clearTimeout(timerId); clearInterval(intervalId); };
	            const startActions = (e) => {
	                e.preventDefault();
	                action();
	                timerId = setTimeout(() => { intervalId = setInterval(action, speed); }, delay);
	            };
	            button.addEventListener('mousedown', startActions);
	            button.addEventListener('touchstart', startActions, { passive: false });
	            button.addEventListener('mouseup', stopActions);
	            button.addEventListener('mouseleave', stopActions);
	            button.addEventListener('touchend', stopActions);
	        };

	        const updateUI = () => {
	            calorieDisplay.innerHTML = `<span class="value">${currentCalories}</span> <span class="unit">kcal</span>`;
	            const progressPercentage = (currentCalories / maxCalories) * 100;
	            progressFill.style.width = `${progressPercentage}%`;
	        };

	        const incrementCalories = () => { if (currentCalories < maxCalories) { currentCalories = Math.min(maxCalories, currentCalories + step); updateUI(); } };
	        const decrementCalories = () => { if (currentCalories > minCalories) { currentCalories = Math.max(minCalories, currentCalories - step); updateUI(); } };
	        
	        addHoldFunctionality(plusBtn, incrementCalories);
	        addHoldFunctionality(minusBtn, decrementCalories);
	        updateUI();

	        mealBtnSection.addEventListener('click', (e) => {
	            if (e.target.tagName === 'BUTTON') {
	                e.preventDefault();
	                mealBtnSection.querySelectorAll('button').forEach(btn => btn.style.backgroundColor = '');
	                e.target.style.backgroundColor = 'rgb(255, 206, 100)';
	                selectedMealType = e.target.textContent;
	            }
	        });
	        
	        // *** THIS IS THE FIX: ADDED CALENDAR LOGIC ***
	        const monthYearEl = document.getElementById('month-year');
	        const weekViewEl = document.getElementById('week-view');
	        const prevWeekBtn = document.getElementById('prev-week');
	        const nextWeekBtn = document.getElementById('next-week');
	        let calendarCurrentDate = new Date();

	        const renderWeek = () => {
	            weekViewEl.innerHTML = '';
	            monthYearEl.textContent = `${calendarCurrentDate.toLocaleString('default', { month: 'long' })} ${calendarCurrentDate.getFullYear()}`;
	            let startOfWeek = new Date(calendarCurrentDate);
	            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
	            for (let i = 0; i < 7; i++) {
	                let day = new Date(startOfWeek);
	                day.setDate(day.getDate() + i);
	                const dayItem = document.createElement('li');
	                dayItem.classList.add('day');
	                dayItem.dataset.date = day.toISOString().split('T')[0];
	                if (day.toDateString() === new Date().toDateString()) {
	                    dayItem.classList.add('selected');
	                }
	                dayItem.innerHTML = `<span class="day-initial">${day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span><span class="day-number">${day.getDate()}</span>`;
	                weekViewEl.appendChild(dayItem);
	            }
	        };

	        weekViewEl.addEventListener('click', (e) => {
	            const selectedDayEl = e.target.closest('.day');
	            if (!selectedDayEl) return;
	            const previouslySelected = weekViewEl.querySelector('.selected');
	            if (previouslySelected) previouslySelected.classList.remove('selected');
	            selectedDayEl.classList.add('selected');
	        });

	        prevWeekBtn.addEventListener('click', (e) => {
	            e.preventDefault();
	            calendarCurrentDate.setDate(calendarCurrentDate.getDate() - 7);
	            renderWeek();
	        });

	        nextWeekBtn.addEventListener('click', (e) => {
	            e.preventDefault();
	            calendarCurrentDate.setDate(calendarCurrentDate.getDate() + 7);
	            renderWeek();
	        });

	        renderWeek(); // Initial render of the calendar

	        // Function to render the meal log table
	        const renderMeals = (mealsData) => {
	            mealsData.sort((a, b) => new Date(b.date) - new Date(a.date));
	            mealList.innerHTML = `
	                <table>
	                    <thead>
	                        <tr>
	                            <th>Food Item</th>
	                            <th>Calories</th>
	                            <th>Meal Type</th>
	                            <th>Date</th>
	                        </tr>
	                    </thead>
	                    <tbody>
	                        ${mealsData.map(m => `
	                            <tr>
	                                <td>${m.foodItem}</td>
	                                <td>${m.calories}</td>
	                                <td>${m.mealType}</td>
	                                <td>${m.date}</td>
	                            </tr>`).join('')}
	                    </tbody>
	                </table>`;
	        };
	        
	        const fetchAndRenderMeals = () => fetchData('/api/meals', renderMeals);

	        // FORM SUBMISSION LOGIC
	        mealForm.addEventListener('submit', e => {
	            e.preventDefault();
	            const foodItem = document.getElementById('foodItem').value;
	            if (!foodItem) { alert('Please enter a food item.'); return; }
	            const selectedDayEl = document.querySelector('#week-view .day.selected');
	            if (!selectedDayEl) { alert('Please select a date from the calendar.'); return; }
	            
	            const formData = {
	                foodItem: foodItem,
	                calories: currentCalories,
	                mealType: selectedMealType,
	                date: selectedDayEl.dataset.date
	            };
	            
	            postData('/api/meals', formData, fetchAndRenderMeals);
	            mealForm.reset();
	        });

	        // INITIAL PAGE LOAD
	        fetchAndRenderMeals();
	    }

		if (window.location.pathname.endsWith('/goals.html')) {
		        const goalForm = document.getElementById('goalForm');
		        const goalList = document.getElementById('goalList');
		        
		        // --- Widget & Calendar Logic for Goals ---

		        // 1. Target Value Widget Logic
		        const targetValuePath = document.getElementById('target-value-path');
		        const targetText = document.getElementById('target-text');
		        const targetPlusBtn = document.getElementById('target-plus');
		        const targetMinusBtn = document.getElementById('target-minus');

		        let currentTarget = 0;
		        const maxTarget = 300; // Arbitrary max for visual gauge
		        const minTarget = 1;
		        const pathLength = targetValuePath ? targetValuePath.getTotalLength() : 0;

		        // Function to update the SVG gauge and text
		        const updateTargetUI = () => {
		            targetText.innerHTML = `${currentTarget} <span class="unit">Kg</span>`;
		            if (targetValuePath) {
		                const progress = Math.min(Math.max(0, currentTarget / maxTarget), 1);
		                const offset = pathLength * (1 - progress);
		                targetValuePath.style.strokeDasharray = pathLength;
		                targetValuePath.style.strokeDashoffset = offset;
		            }
		        };

		        // Reusable hold functionality (same as meals)
		        const addHoldFunctionality = (button, action, delay = 400, speed = 50) => {
		            let timerId, intervalId;
		            const stopActions = () => { clearTimeout(timerId); clearInterval(intervalId); };
		            const startActions = (e) => {
		                e.preventDefault();
		                action();
		                timerId = setTimeout(() => { intervalId = setInterval(action, speed); }, delay);
		            };
		            button.addEventListener('mousedown', startActions);
		            button.addEventListener('touchstart', startActions, { passive: false });
		            button.addEventListener('mouseup', stopActions);
		            button.addEventListener('mouseleave', stopActions);
		            button.addEventListener('touchend', stopActions);
		        };

		        addHoldFunctionality(targetPlusBtn, () => {
		            currentTarget++;
		            updateTargetUI();
		        });

		        addHoldFunctionality(targetMinusBtn, () => {
		            if (currentTarget > minTarget) {
		                currentTarget--;
		                updateTargetUI();
		            }
		        });

		        updateTargetUI();

		        // 2. Status Toggle Logic
		        const toggleBtn = document.getElementById('status-toggle');
		        const statusLabel = document.getElementById('status-label');
		        const states = [
		            { name: 'Not started', class: 'not-started' },
		            { name: 'Inprogress', class: 'inprogress' },
		            { name: 'Completed', class: 'completed' }
		        ];
		        let currentStateIndex = 0;

		        const updateStatusView = () => {
		            const currentState = states[currentStateIndex];
		            statusLabel.textContent = currentState.name;
		            toggleBtn.classList.remove('not-started', 'inprogress', 'completed');
		            toggleBtn.classList.add(currentState.class);
		        };

		        toggleBtn.addEventListener('click', () => {
		            currentStateIndex = (currentStateIndex + 1) % states.length;
		            updateStatusView();
		        });

		        // 3. Calendar Logic (Reusable for Start and Target Date)
		        const setupCalendar = (headerId, listId, prevBtnId, nextBtnId, prefix) => {
		            const monthYearEl = document.getElementById(headerId);
		            const weekViewEl = document.getElementById(listId);
		            const prevBtn = document.getElementById(prevBtnId);
		            const nextBtn = document.getElementById(nextBtnId);
		            let currentDate = new Date();

		            const render = () => {
		                weekViewEl.innerHTML = '';
		                monthYearEl.textContent = `${prefix}: ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
		                let startOfWeek = new Date(currentDate);
		                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

		                for (let i = 0; i < 7; i++) {
		                    let day = new Date(startOfWeek);
		                    day.setDate(day.getDate() + i);
		                    const dayItem = document.createElement('li');
		                    dayItem.classList.add('day');
		                    dayItem.dataset.date = day.toISOString().split('T')[0];
		                    
		                    // Auto-select today if it's in view and nothing else selected (optional logic, 
		                    // but here we just check if it matches today for visual cue)
		                    if (day.toDateString() === new Date().toDateString()) {
		                         // Optional: dayItem.classList.add('selected'); 
		                    }

		                    dayItem.innerHTML = `
		                        <span class="day-initial">${day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
		                        <span class="day-number">${day.getDate()}</span>
		                    `;
		                    weekViewEl.appendChild(dayItem);
		                }
		                // Ensure one item is selected if we want a default, or let user click
		            };

		            weekViewEl.addEventListener('click', (e) => {
		                const selectedDayEl = e.target.closest('.day');
		                if (!selectedDayEl) return;
		                const previouslySelected = weekViewEl.querySelector('.selected');
		                if (previouslySelected) previouslySelected.classList.remove('selected');
		                selectedDayEl.classList.add('selected');
		            });

		            prevBtn.addEventListener('click', (e) => { e.preventDefault(); currentDate.setDate(currentDate.getDate() - 7); render(); });
		            nextBtn.addEventListener('click', (e) => { e.preventDefault(); currentDate.setDate(currentDate.getDate() + 7); render(); });
		            
		            render();
		        };

		        setupCalendar('startdate-header', 'week-view-start', 'prev-week-start', 'next-week-start', 'Start');
		        setupCalendar('targetdate-header', 'week-view-target', 'prev-week-target', 'next-week-target', 'End');

		        // 4. Render Goals List
		        const renderGoals = (goals) => {
		            goalList.innerHTML = `<table><thead><tr><th>Goal</th><th>Target</th><th>Start Date</th><th>Target Date</th><th>Status</th></tr></thead><tbody>${goals.map(g => `<tr><td>${g.goalType}</td><td>${g.targetValue}</td><td>${g.startDate}</td><td>${g.targetDate}</td><td>${g.status}</td></tr>`).join('')}</tbody></table>`;
		        };
		        const fetchAndRenderGoals = () => fetchData('/api/goals', renderGoals);

		        // 5. Submit Logic
		        goalForm.addEventListener('submit', e => {
		            e.preventDefault();
		            
		            const goalType = document.getElementById('goalType').value;
		            const startEl = document.querySelector('#week-view-start .day.selected');
		            const targetEl = document.querySelector('#week-view-target .day.selected');
		            
		            if (!startEl || !targetEl) {
		                alert("Please select both a Start Date and a Target Date.");
		                return;
		            }

		            const formData = { 
		                goalType: goalType, 
		                targetValue: currentTarget, // From widget variable
		                startDate: startEl.dataset.date, // From calendar 1
		                targetDate: targetEl.dataset.date, // From calendar 2
		                status: states[currentStateIndex].name // From toggle state
		            };
		            
		            postData('/api/goals', formData, fetchAndRenderGoals);
		            
		            // Reset Form Logic
		            goalForm.reset();
		            currentTarget = 10; updateTargetUI(); // Reset widget
		            currentStateIndex = 0; updateStatusView(); // Reset toggle
		            // Remove selections from calendars
		            document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
		        });
		        
		        fetchAndRenderGoals();
		    }

	if (window.location.pathname.endsWith('/progress.html')) {
	        const progressForm = document.getElementById('progressForm');
	        const progressList = document.getElementById('progressList');

	        const renderProgress = (progressData) => {
	            progressData.sort((a, b) => new Date(b.date) - new Date(a.date));
	            progressList.innerHTML = `
	                <table>
	                    <thead>
	                        <tr>
	                            <th>Weight (kg)</th>
	                            <th>Body Fat (%)</th>
	                            <th>Date</th>
	                        </tr>
	                    </thead>
	                    <tbody>
	                        ${progressData.map(p => `
	                            <tr>
	                                <td>${p.weight.toFixed(1)}</td>
	                                <td>${p.bodyFatPercentage != null ? p.bodyFatPercentage.toFixed(1) : 'N/A'}</td>
	                                <td>${p.date}</td>
	                            </tr>`).join('')}
	                    </tbody>
	                </table>`;
	        };
	        
	        const fetchAndRenderProgress = () => {
	            fetchData('/api/progress', renderProgress);
	        };

	        // --- FORM SUBMISSION LOGIC ---
	        progressForm.addEventListener('submit', e => {
	            e.preventDefault();

	            // 1. Get the selected date from the calendar
	            const selectedDayEl = document.querySelector('#week-view .day.selected');
	            if (!selectedDayEl) {
	                alert('Please select a date from the calendar.');
	                return;
	            }
	            const selectedDate = selectedDayEl.dataset.date;

	            // *** THIS IS THE FIX ***
	            // 2. Read the values DIRECTLY from the UI elements at the time of submission.
	            const weightTextEl = document.getElementById('weight-text');
	            const bodyFatValueEl = document.getElementById('body-fat-value');
	            
	            // Use parseFloat to extract the number from strings like "83 kg" or "21.1 %"
	            const weightValue = parseFloat(weightTextEl.textContent);
	            const bodyFatValue = parseFloat(bodyFatValueEl.textContent);
	            
	            // 3. Prepare the form data using these freshly read values
	            const formData = {
	                weight: weightValue,
	                bodyFatPercentage: bodyFatValue,
	                date: selectedDate
	            };
	            
	            // 4. Post the data and re-render the list on success
	            postData('/api/progress', formData, fetchAndRenderProgress);
	        });

	        // --- INITIAL PAGE LOAD ---
	        fetchAndRenderProgress(); // Load the table with existing data
	        
	        // Note: The widget initialization is handled by the local script in progress.html,
	        // which sets them to their default UI state. Our logic now correctly reads from that state.
	    }
});