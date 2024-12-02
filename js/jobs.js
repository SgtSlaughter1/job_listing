// Track active filters
let activeFilters = new Set(); // `Set` is used to store unique filter tags.
let jobs = []; // Array to hold job data fetched from the server

// Fetch job data from a JSON file
async function fetchJobs() {
    // `async` allows the function to handle asynchronous operations, such as data fetching.
    try {
        const response = await fetch('/data.json'); // `fetch` is used to make an HTTP request to get the data.
        // `await` pauses execution until the fetch is done and data is returned.
        if (!response.ok) throw new Error('Failed to load jobs'); // If the request fails, throw an error
        jobs = await response.json(); // Convert the fetched data into JSON format.
        renderJobs(); // Call the function to display the jobs.
    } catch (error) {
        console.error('Error fetching jobs:', error); // `console.error` logs errors to the browser console.
    }
};

// Create job card HTML structure
function createJobCard(job) {
    const tags = [job.role, job.level, ...job.languages, ...job.tools]; 
    // `...` (spread operator) allows combining arrays, like `languages` and `tools`, into the `tags` array.

    const tagsHtml = tags.map(tag => `
        <span class="badge tag filter-tag" data-tag="${tag}">${tag}</span>
    `).join(''); 
    // `map` creates a new array where each `tag` is converted to HTML code.
    // `join('')` combines the array into a single string without commas.

    return `
        <div class="card mb-4 job-card">
        
            <div class="card-body">
                <div class="d-flex align-items-center head mb-3">
                <img src="${job.logo}" alt="${job.company} logo" class="me-3" width="50" height="50">
                    <h5 class="card-title">${job.company}</h5>
                    ${job.new ? '<span class="badge new mx-2">New!</span>' : ''} 
                    ${job.featured ? '<span class="badge featured">Featured</span>' : ''}
                </div>
                <div class="d-flex jobs">
                <h4 class="heads">${job.position}</h4> 
                <div class="tools">${tagsHtml}</div>
                </div>
                <p class="text-muted mute">${job.postedAt} · ${job.contract} · ${job.location}</p>
            </div>
                <div class="bottom">
                <hr>
                <div>${tagsHtml}</div>
                </div>
        </div>
    `;
    // Template literals (``) allow embedding variables (`${...}`) directly into strings.
}

// Show job listings based on active filters
function renderJobs() {
    const jobListings = document.getElementById('job-listings'); // Get the HTML element where job cards will be displayed.
    
    const filteredJobs = jobs.filter(job => {
        if (activeFilters.size === 0) return true; // If no filters are selected, show all jobs.
        const jobTags = new Set([job.role, job.level, ...job.languages, ...job.tools]);
        // `Set` ensures no duplicate tags for each job.
        return Array.from(activeFilters).every(filter => jobTags.has(filter)); 
        // `every` checks if all active filters exist in the job's tags.
    });

    // Update the inner HTML of the container with the filtered jobs
    jobListings.innerHTML = filteredJobs.map(createJobCard).join(''); 
    // `.map` calls `createJobCard` for each job, and `.join('')` puts them together.
}

// Add a filter to the active filters set
function addFilter(filter) {
    activeFilters.add(filter); // `add` adds the filter to the `Set`.
    updateFilterBar(); // Update the filter UI.
    renderJobs(); // Re-render the jobs with the new filters.
}

// Remove a filter from the active filters set
function removeFilter(filter) {
    activeFilters.delete(filter); // `delete` removes the filter from the `Set`.
    updateFilterBar(); // Update the filter UI.
    renderJobs(); // Re-render the jobs after removing the filter.
}

// Update the filter bar UI
function updateFilterBar() {
    const filterBar = document.getElementById('filter-bar');
    const filterTags = document.getElementById('filter-tags');

    if (activeFilters.size > 0) { // If there are active filters
        filterBar.style.display = 'block'; // Show the filter bar
        filterTags.innerHTML = Array.from(activeFilters).map(filter => `
            <span class="badge btn2">
                ${filter}
                <button type="button" class="btn-close close btn-close-white" aria-label="Close" data-filter="${filter}"></button> 
            </span>
        `).join(''); // Create a badge for each filter with a close button.
    } else { 
        filterBar.style.display = 'none'; // Hide the filter bar if there are no filters
    }
}

// Clear all active filters
document.getElementById('clear-filters').addEventListener('click', () => {
    activeFilters.clear(); // `clear` removes all elements from the `Set`.
    updateFilterBar(); // Update the filter UI.
    renderJobs(); // Show all jobs without filters.
});

// Handle adding/removing filters when tags or close buttons are clicked
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('filter-tag')) { 
        // `classList.contains` checks if the clicked element has a class
        const filter = event.target.dataset.tag; // Get the tag from the data attribute.
        addFilter(filter); // Add the filter
    }

    if (event.target.classList.contains('btn-close')) { 
        const filter = event.target.dataset.filter; // Get the filter from the data attribute.
        removeFilter(filter); // Remove the filter
    }
});

// Fetch jobs once the page is loaded
document.addEventListener('DOMContentLoaded', fetchJobs); 
// `DOMContentLoaded` ensures the fetch operation only starts when the page has fully loaded.
