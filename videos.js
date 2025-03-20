let currentVideosDataArr = [];      // Stores the current videos info to display on UI
let perPageLimit = 10;              // Stores per page record limit
let nextPage = true;                // Stores info if next page available
let previousPage = false;           // Stores info if previous page available
let totalPages = 16;                // Stores the total number of pages
let currentPage = 1;                // Stores current page number
let totalItems = 150;               // Stores total number of records available

// Document Selectors to manipulate DOM
const videoContainer = document.getElementById('videosContainer');
const searchContainer = document.getElementById('search');
const recordCountContainer = document.getElementById('recordCount');
const pageNumberContainer = document.getElementById('pageNumber');
const pagePrevContainer = document.getElementById('page-prev');
const pageNextContainer = document.getElementById('page-next');

// Function to load and store videos and metadata via API call
const loadVideosAPICall = async(pageNumber = 1) => {
    // API Call
    let loadVideoRecords = await fetch(`https://api.freeapi.app/api/v1/public/youtube/videos?page=${pageNumber}`).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Api Request Failed to load the data');
        }
    });

    if (loadVideoRecords.success) {
        loadVideoRecords = loadVideoRecords.data;

        currentVideosDataArr = loadVideoRecords.data;
        perPageLimit = loadVideoRecords.limit;
        nextPage = loadVideoRecords.nextPage;
        previousPage = loadVideoRecords.previousPage;
        totalPages = loadVideoRecords.totalPages;
        currentPage = loadVideoRecords.page;
        totalItems = loadVideoRecords.totalItems;
    } else {
        throw new Error('Failed to load the videos');
    }
}

// Function to reset page footer info
const resetPageDetails = (customCount) => {
    const recordStartNum = perPageLimit * (currentPage - 1) + 1;
    const recordEndNum = perPageLimit * currentPage;

    // Custom count will be provided in case of search result
    if (!customCount || customCount === 0 || customCount === perPageLimit) {
        recordCountContainer.innerText = `${recordStartNum} - ${recordEndNum} out of ${totalItems}`;
    } else {
        recordCountContainer.innerText = `${customCount} out of ${totalItems}`;
    }
    pageNumberContainer.innerText = `${currentPage} of ${totalPages}`;

    if (previousPage) {
        pagePrevContainer.classList.remove('hide');
        pagePrevContainer.classList.add('show');
    } else {
        pagePrevContainer.classList.remove('show');
        pagePrevContainer.classList.add('hide');
    }

    if (nextPage) {
        pageNextContainer.classList.remove('hide');
        pageNextContainer.classList.add('show');
    } else {
        pageNextContainer.classList.remove('show');
        pageNextContainer.classList.add('hide');
    }
}

// Function to be called to build the video cards and push it to the container
const buildVideoCards = (videoDtl) => {
    // Video Details
    const videoId = videoDtl.id;
    const videoTitle = videoDtl.snippet.title;
    const channelTitle = videoDtl.snippet.channelTitle;
    const videoThumbnail = videoDtl.snippet.thumbnails.maxres.url;

    let videoPublishDate = new Date(videoDtl.snippet.publishedAt);
    const date = videoPublishDate.getDate();
    const month = videoPublishDate.getMonth() <= 9 ? `0${videoPublishDate.getMonth()}` : videoPublishDate.getMonth();
    const year = videoPublishDate.getFullYear();
    videoPublishDate = `${year}-${month}-${date}`;

    // Video Statistics
    const likeCount = videoDtl.statistics.likeCount;
    const viewCount = videoDtl.statistics.viewCount;
    const commentCount = videoDtl.statistics.commentCount;

    // Build video cards dynamically
    const videoCardDiv = document.createElement('div');
    videoCardDiv.classList.add('videos');

    // Video Thumbnail
    const videoLinkImg = document.createElement('img');
    videoLinkImg.setAttribute('src', videoThumbnail);
    videoLinkImg.classList.add('video-thumbnail');

    // Video Content
    const videoContentDiv = document.createElement('div');
    videoContentDiv.classList.add('video-content');

    // Video Title
    let detailsP = document.createElement('p');
    detailsP.classList.add('video-title');
    detailsP.innerText = videoTitle;
    videoContentDiv.appendChild(detailsP);

    // Channel Name
    detailsP = document.createElement('p');
    detailsP.classList.add('channel-name');
    detailsP.innerText = channelTitle;
    videoContentDiv.appendChild(detailsP);

    // Publish Date
    detailsP = document.createElement('p');
    detailsP.classList.add('publish-date');
    detailsP.innerText = videoPublishDate;
    videoContentDiv.appendChild(detailsP);

    // Video Metadata
    const metadataWrapperDiv = document.createElement('div');
    metadataWrapperDiv.classList.add('video-metadata-wrapper');

    const videoMetadataDiv = document.createElement('div');
    videoMetadataDiv.classList.add('video-metadata');

    // View Count metadata info
    let metadataSpan = document.createElement('span');
    metadataSpan.classList.add('material-symbols-rounded');
    metadataSpan.innerText = 'visibility';

    detailsP = document.createElement('p');
    detailsP.innerText = viewCount;

    videoMetadataDiv.appendChild(metadataSpan);
    videoMetadataDiv.appendChild(detailsP);

    // Comment Count metadata info
    metadataSpan = document.createElement('span');
    metadataSpan.classList.add('material-symbols-rounded');
    metadataSpan.innerText = 'chat_bubble';

    detailsP = document.createElement('p');
    detailsP.innerText = commentCount;

    videoMetadataDiv.appendChild(metadataSpan);
    videoMetadataDiv.appendChild(detailsP);

    // Like Count metadata info
    metadataSpan = document.createElement('span');
    metadataSpan.classList.add('material-symbols-rounded');
    metadataSpan.innerText = 'thumb_up';

    detailsP = document.createElement('p');
    detailsP.innerText = likeCount;

    videoMetadataDiv.appendChild(metadataSpan);
    videoMetadataDiv.appendChild(detailsP);

    metadataWrapperDiv.appendChild(videoMetadataDiv);
    videoContentDiv.appendChild(metadataWrapperDiv);

    videoCardDiv.appendChild(videoLinkImg);
    videoCardDiv.appendChild(videoContentDiv);

    // Youtube Link
    const videoLinkA = document.createElement('a');
    videoLinkA.href = `https://youtube.com/watch?v=${videoId}`;
    videoLinkA.target = '_blank';
    videoLinkA.appendChild(videoCardDiv);
    
    videoContainer.appendChild(videoLinkA);
}

// Function to structure the API response data in a structured format to display on UI
const loadVideosForUI = async(pageNumber = 1) => {
    await loadVideosAPICall(pageNumber);

    videoContainer.innerHTML = '';

    currentVideosDataArr.forEach((videoDtl, index) => {
        videoDtl = videoDtl.items
        buildVideoCards(videoDtl);
    });
    
    // Call page footer reset function
    resetPageDetails();
}

// Event emitter function to be called when user clicks on page prev-next button
function onClickPageBtn() {
    let operation = event.target.getAttribute('value');
    searchContainer.value = '';

    let newPageNumber = currentPage;
    if (operation === 'next') {
        if ((newPageNumber + 1) > totalPages) {
            throw Error('No more page exist to show');
        } else {
            loadVideosForUI(newPageNumber + 1);
        }
    } else if (operation === 'prev') {
        if ((newPageNumber - 1) < 0) {
            throw Error('Page number cannot be smaller than 0');
        } else {
            loadVideosForUI(newPageNumber - 1);
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to initialize events for page prev-next buttons
const initializePage = () => {
    pagePrevContainer.addEventListener('click', onClickPageBtn);
    pageNextContainer.addEventListener('click', onClickPageBtn);
}

// Event emitter function to be called when user search for a video
function searchVideoEvent() {
    const wordToCheck = event.target.value;
    let matchResultCount = 0;

    videoContainer.innerHTML = '';

    currentVideosDataArr.forEach((videoDtl, index) => {
        videoDtl = videoDtl.items;

        // The record will be formed only if the user input matches with video title or channel title
        if (
            wordToCheck.length === 0 ||
            videoDtl.snippet.title.toLowerCase().includes(wordToCheck.toLowerCase()) ||
            videoDtl.snippet.channelTitle.toLowerCase().includes(wordToCheck.toLowerCase())
        ) {
            buildVideoCards(videoDtl);
            matchResultCount++;
        }
    });
    
    // Call page footer reset function with custom result count
    resetPageDetails(matchResultCount);
}

// Search for a video based on user input
const searchVideo = (initialAutoLoad) => {
    // The below code is to clear the text field in case of page reload
    if (initialAutoLoad) {
        searchContainer.value = '';
    }

    searchContainer.addEventListener('input', searchVideoEvent);
}

// Imediate execution of functions on loading the script
loadVideosForUI();
searchVideo(true);
initializePage();
