// ----------------------- TODAY SCHEDULE JS -----------------------

async function loadSchedule() {
    try {
        // Fetch JSON data
        const response = await fetch("/json/schedule.json");
        const scheduleData = await response.json();
  
        // Get current day and time
        const now = new Date();
        const currentDay = now.toLocaleString("en-US", { weekday: "long" });
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert time to minutes
  
        // Select the schedule container
        const scheduleList = document.getElementById("schedule-list");
        scheduleList.innerHTML = ""; // Clear previous content
        let currentDayElement = null; // Store reference for scrolling
  
        // Loop through all days
        for (let day in scheduleData) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("schedule-day");
  
            // Highlight the current day & set an ID for scrolling
            if (day === currentDay) {
                dayDiv.classList.add("current-day");
                dayDiv.id = "current-day"; // Unique ID for scrolling
                currentDayElement = dayDiv;
            }
  
            // Add day title
            dayDiv.innerHTML = `<h3>${day}</h3>`;
  
            // Loop through the shows for the day
            scheduleData[day].forEach(show => {
                const showItem = document.createElement("div");
                showItem.classList.add("schedule-item");
  
                // Convert show times to minutes
                const [startHours, startMinutes] = show.start.split(":").map(Number);
                const [endHours, endMinutes] = show.end.split(":").map(Number);
                const startTime = startHours * 60 + startMinutes;
                const endTime = endHours * 60 + endMinutes;
  
                // Highlight the currently playing show
                if (day === currentDay && currentTime >= startTime && currentTime < endTime) {
                    showItem.classList.add("current-show");
                }
  
                showItem.innerHTML = `${show.start} &#8212; ${show.end} &#124; ${show.show}`;
                dayDiv.appendChild(showItem);
            });
  
            scheduleList.appendChild(dayDiv);
        }
  
        // Scroll to the current day after rendering
        if (currentDayElement) {
            setTimeout(() => {
                currentDayElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 500); // Small delay to ensure rendering is complete
        }
  
    } catch (error) {
        console.error("Error loading schedule:", error);
    }
  }
  
  // Load schedule immediately & refresh every 5 minutes
  loadSchedule();
  setInterval(loadSchedule, 5 * 60 * 1000); // Refresh every 5 minutes (300,000 ms)
  
  // Also ensure it runs when the DOM is fully ready (fallback)
  document.addEventListener("DOMContentLoaded", loadSchedule);