document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the element
    const configElement = document.getElementById('room-config');

    // 2. Extract data from dataset
    const APP_ID = configElement.dataset.appId;
    const CHANNEL = configElement.dataset.channel; // was data-channel
    const USERNAME = configElement.dataset.username;
    const DISPLAY_NAME = configElement.dataset.displayName; // was data-display-name
    let currentDisplayName = DISPLAY_NAME;

    // 3. Logic that was previously dynamic
    const UID = Math.floor(Math.random() * 10000);
    const TOKEN = null;

    console.log("Joined Room:", CHANNEL);

// Browser detection
const isEdge = /Edg/.test(navigator.userAgent);
const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
const codecPreference = isEdge ? 'h264' : 'vp8';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: codecPreference });

let localTracks = [];
let remoteUsers = {};
let participantNames = {};
let participantUsernames = {};
let isMicMuted = false;
let isVideoOff = false;
let isScreenSharing = false;
let screenTrack = null;

function addRippleEffect(element) {
    // Ripple logic is mostly CSS hover now, but keep for legacy actions if needed
    if (navigator.vibrate) navigator.vibrate(50);
}

async function checkMediaPermissions() {
    try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        const micPermissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'denied' || micPermissionStatus.state === 'denied') {
            showPermissionGuide();
            return false;
        }
        return true;
    } catch (error) { return true; }
}

function showPermissionGuide() {
    const guide = `
        <div class="alert alert-danger m-4 border-2" role="alert">
            <h5 class="alert-heading"><i class="bi bi-exclamation-triangle-fill"></i> Permission Needed</h5>
            <p>Please click the camera/lock icon in your address bar and allow Camera and Microphone access.</p>
            <button onclick="location.reload()" class="btn btn-outline-danger">Reload Page</button>
        </div>`;
    document.getElementById('video-streams').innerHTML = guide;
}

function showToast(message, type = 'info', icon = 'bi-info-circle-fill') {
    // Using standard DOM creation, styling with Bootstrap classes
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-success' : (type === 'error' ? 'bg-danger' : 'bg-primary');

    toast.className = `position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-3 shadow text-white d-flex align-items-center gap-2 z-3 ${bgClass}`;
    toast.style.animation = 'slideDown 0.3s forwards';
    toast.innerHTML = `<i class="bi ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStatusBadges() {
    document.querySelectorAll('.status-badge-container').forEach(b => b.remove());

    const badges = [];
    if (isMicMuted) badges.push({class: 'border-danger text-danger', icon: 'bi-mic-mute-fill', text: 'Muted'});
    if (isVideoOff) badges.push({class: 'border-warning text-warning', icon: 'bi-camera-video-off-fill', text: 'Video Off'});
    if (isScreenSharing) badges.push({class: 'border-success text-success', icon: 'bi-display', text: 'Sharing'});

    badges.forEach((b, index) => {
        const div = document.createElement('div');
        div.className = `status-badge-container position-fixed start-0 ms-3 px-3 py-2 rounded-pill border glass-overlay d-flex align-items-center gap-2 small fw-bold z-2 ${b.class}`;
        div.style.bottom = `${90 + (index * 50)}px`;
        div.innerHTML = `<i class="bi ${b.icon}"></i> ${b.text}`;
        document.body.appendChild(div);
    });
}

let joinAndDisplayLocalStream = async () => {
    try {
        const hasPermission = await checkMediaPermissions();
        if (!hasPermission && isEdge) return;

        client.on('user-published', handleUserJoined);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);

        await client.join(APP_ID, CHANNEL, TOKEN, UID);

        // Track creation logic (simplified for brevity)
        if (isEdge) {
             // ... Edge specific logic from original file ...
             try { localTracks[0] = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: "music_standard" }); }
             catch(e) { console.error(e); isMicMuted = true; }
             try { localTracks[1] = await AgoraRTC.createCameraVideoTrack({ encoderConfig: "480p_1", optimizationMode: "detail" }); }
             catch(e) { console.error(e); isVideoOff = true; }
        } else {
            try {
                localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
            } catch (error) {
                // ... Error handling from original file ...
                if (error.code === 'NOT_READABLE' || error.message.includes('video')) {
                    localTracks[0] = await AgoraRTC.createMicrophoneAudioTrack();
                    isVideoOff = true;
                } else {
                    isVideoOff = true; isMicMuted = true;
                }
            }
        }

        // Inject Player with Bootstrap classes
        let player = `<div class="video-container position-relative rounded-4 overflow-hidden shadow border border-2 border-transparent ${isVideoOff ? 'video-off' : ''}" id="user-container-${UID}">
                        <div class="video-player w-100 h-100" id="user-${UID}"></div>

                        <div class="video-muted-icon position-absolute top-50 start-50 translate-middle bg-danger bg-opacity-25 border border-danger border-3 rounded-circle p-3 video-muted-animation ${isVideoOff ? 'd-flex' : 'd-none'} align-items-center justify-content-center" style="width: 80px; height: 80px;">
                            <i class="bi bi-camera-video-off-fill text-danger fs-1"></i>
                        </div>

                        <div class="position-absolute top-0 end-0 m-3">
                            <span class="glass-overlay px-2 py-1 rounded-pill small d-flex align-items-center gap-1 ${isMicMuted ? 'text-danger' : 'text-success'}" id="audio-status-${UID}">
                                <i class="bi ${isMicMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}"></i>
                            </span>
                        </div>

                        <div class="position-absolute bottom-0 start-0 m-3 glass-overlay px-3 py-2 rounded-pill border border-white border-opacity-10 shadow-sm d-flex align-items-center gap-2">
                            <i class="bi bi-person-circle text-primary small"></i>
                            <span class="fw-bold small text-white" id="display-name-${UID}">${currentDisplayName}</span>
                            <span class="badge bg-primary ms-1" style="font-size: 10px;">You</span>
                        </div>
                      </div>`;

        updateParticipantCount();
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

        if (localTracks[1]) localTracks[1].play(`user-${UID}`);
        const tracksToPublish = localTracks.filter(track => track !== null);
        if (tracksToPublish.length > 0) await client.publish(tracksToPublish);

        // UI updates
        if (isVideoOff) {
            const btn = document.getElementById('video-btn');
            btn.classList.replace('btn-secondary', 'btn-danger');
            btn.classList.add('pulse-red');
            btn.querySelector('i').className = 'bi bi-camera-video-off-fill fs-5';
        }
        if (isMicMuted) {
            const btn = document.getElementById('mic-btn');
            btn.classList.replace('btn-secondary', 'btn-danger');
            btn.classList.add('pulse-red');
            btn.querySelector('i').className = 'bi bi-mic-mute-fill fs-5';
        }
        updateStatusBadges();

    } catch (error) { console.error(error); showToast('Failed to join', 'error'); }

    chatSocket.send(JSON.stringify({ 'type': 'video_joined', 'username': USERNAME, 'display_name': currentDisplayName, 'uid': UID }));
};

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    let playerElement = document.getElementById(`user-container-${user.uid}`);
    if (!playerElement) {
        const displayName = participantNames[user.uid] || participantUsernames[user.uid] || 'Guest';
        const player = `<div class="video-container position-relative rounded-4 overflow-hidden shadow border border-2 border-transparent video-off" id="user-container-${user.uid}">
                    <div class="video-player w-100 h-100" id="user-${user.uid}"></div>

                    <div class="video-muted-icon position-absolute top-50 start-50 translate-middle bg-danger bg-opacity-25 border border-danger border-3 rounded-circle p-3 video-muted-animation d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                        <i class="bi bi-camera-video-off-fill text-danger fs-1"></i>
                    </div>

                    <div class="position-absolute top-0 end-0 m-3">
                        <span class="glass-overlay px-2 py-1 rounded-pill small d-flex align-items-center gap-1 text-success" id="audio-status-${user.uid}">
                            <i class="bi bi-mic-fill"></i>
                        </span>
                    </div>

                    <div class="position-absolute bottom-0 start-0 m-3 glass-overlay px-3 py-2 rounded-pill border border-white border-opacity-10 shadow-sm d-flex align-items-center gap-2">
                        <i class="bi bi-person-circle text-primary small"></i>
                        <span class="fw-bold small text-white" id="display-name-${user.uid}">${displayName}</span>
                    </div>
                  </div>`;
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
        updateParticipantCount();
    }

    if (mediaType === 'video' && user.videoTrack) {
        user.videoTrack.play(`user-${user.uid}`);
        const container = document.getElementById(`user-container-${user.uid}`);
        if (container) {
            container.classList.remove('video-off');
            container.querySelector('.video-muted-icon').classList.replace('d-flex', 'd-none');
        }
    }
    if (mediaType === 'audio' && user.audioTrack) { user.audioTrack.play(); }
};

let handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
        const container = document.getElementById(`user-container-${user.uid}`);
        if (container) {
            container.classList.add('video-off');
            container.querySelector('.video-muted-icon').classList.replace('d-none', 'd-flex');
        }
    }
};

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    const el = document.getElementById(`user-container-${user.uid}`);
    if(el) el.remove();
    updateParticipantCount();
};

function updateParticipantCount() {
    const count = Object.keys(remoteUsers).length + 1;
    document.getElementById('participant-count').textContent = count;
    document.getElementById('panel-participant-count').textContent = count;
    updateParticipantsList();
}

function updateParticipantsList() {
    const list = document.getElementById('participants-list');
    list.innerHTML = '';

    // Local User Item
    list.innerHTML += `
        <div class="d-flex align-items-center gap-3 p-2 rounded-3 bg-secondary bg-opacity-10 mb-2">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center fw-bold text-white" style="width: 36px; height: 36px;">${currentDisplayName.charAt(0).toUpperCase()}</div>
            <div class="flex-fill">
                <div class="fw-bold small text-white">
                    <span id="my-display-name">${currentDisplayName}</span> (You)
                    <i class="bi bi-pencil-square ms-2 text-secondary" style="cursor: pointer;" onclick="editDisplayName()" title="Edit name"></i>
                </div>
                <div class="text-secondary" style="font-size: 11px;">${USERNAME} • Host</div>
            </div>
            <i class="bi ${isMicMuted ? 'bi-mic-mute-fill text-danger' : 'bi-mic-fill text-success'}"></i>
        </div>`;

    // Remote Users
    Object.keys(remoteUsers).forEach(uid => {
        const displayName = participantNames[uid] || participantUsernames[uid] || 'Guest';
        const username = participantUsernames[uid] || 'Unknown';
        list.innerHTML += `
            <div class="d-flex align-items-center gap-3 p-2 rounded-3 bg-secondary bg-opacity-10 mb-2">
                <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center fw-bold text-white" style="width: 36px; height: 36px;">${displayName.charAt(0).toUpperCase()}</div>
                <div class="flex-fill">
                    <div class="fw-bold small text-white">${displayName}</div>
                    <div class="text-secondary" style="font-size: 11px;">${username}</div>
                </div>
                <i class="bi bi-mic-fill text-success"></i>
            </div>`;
    });
}

// --- BUTTON CONTROLS (Updated with Bootstrap classes toggle) ---

document.getElementById('mic-btn').onclick = async function() {
    if (!localTracks[0]) return showToast('Microphone not available', 'error');

    isMicMuted = !isMicMuted;
    await localTracks[0].setEnabled(!isMicMuted);

    const icon = this.querySelector('i');
    const audioStatus = document.getElementById(`audio-status-${UID}`);

    if (isMicMuted) {
        icon.className = 'bi bi-mic-mute-fill fs-5';
        this.classList.replace('btn-secondary', 'btn-danger');
        this.classList.add('pulse-red');
        if(audioStatus) {
            audioStatus.className = 'glass-overlay px-2 py-1 rounded-pill small d-flex align-items-center gap-1 text-danger';
            audioStatus.querySelector('i').className = 'bi bi-mic-mute-fill';
        }
        showToast('Microphone muted', 'error', 'bi-mic-mute-fill');
    } else {
        icon.className = 'bi bi-mic-fill fs-5';
        this.classList.replace('btn-danger', 'btn-secondary');
        this.classList.remove('pulse-red');
        if(audioStatus) {
            audioStatus.className = 'glass-overlay px-2 py-1 rounded-pill small d-flex align-items-center gap-1 text-success';
            audioStatus.querySelector('i').className = 'bi bi-mic-fill';
        }
        showToast('Microphone unmuted', 'success', 'bi-mic-fill');
    }
    updateParticipantsList();
    updateStatusBadges();
};

document.getElementById('video-btn').onclick = async function() {
    if (!localTracks[1]) return showToast('Camera not available', 'error');

    isVideoOff = !isVideoOff;
    await localTracks[1].setEnabled(!isVideoOff);

    const icon = this.querySelector('i');
    const videoContainer = document.getElementById(`user-container-${UID}`);
    const mutedIcon = videoContainer.querySelector('.video-muted-icon');

    if (isVideoOff) {
        icon.className = 'bi bi-camera-video-off-fill fs-5';
        this.classList.replace('btn-secondary', 'btn-danger');
        this.classList.add('pulse-red');
        videoContainer.classList.add('video-off');
        mutedIcon.classList.replace('d-none', 'd-flex');
        showToast('Camera turned off', 'error', 'bi-camera-video-off-fill');
    } else {
        icon.className = 'bi bi-camera-video-fill fs-5';
        this.classList.replace('btn-danger', 'btn-secondary');
        this.classList.remove('pulse-red');
        videoContainer.classList.remove('video-off');
        mutedIcon.classList.replace('d-flex', 'd-none');
        showToast('Camera turned on', 'success', 'bi-camera-video-fill');
    }
    updateStatusBadges();
};

document.getElementById('share-btn').onclick = async function() {
    if (!isScreenSharing) {
        try {
            const screenConfig = isEdge ? { encoderConfig: "1080p_1", optimizationMode: "detail" } : {};
            screenTrack = await AgoraRTC.createScreenVideoTrack(screenConfig, "auto");
            await client.unpublish([localTracks[1]]);
            await client.publish([screenTrack]);
            screenTrack.play(`user-${UID}`);

            isScreenSharing = true;
            this.classList.replace('btn-secondary', 'btn-success');
            this.classList.add('pulse-green');
            this.querySelector('i').className = 'bi bi-stop-circle-fill fs-5';
            showToast('Screen sharing started', 'success', 'bi-display');
        } catch (error) { console.error(error); showToast('Sharing failed', 'error'); }
    } else {
        await client.unpublish([screenTrack]);
        screenTrack.close();
        await client.publish([localTracks[1]]);
        localTracks[1].play(`user-${UID}`);

        isScreenSharing = false;
        this.classList.replace('btn-success', 'btn-secondary');
        this.classList.remove('pulse-green');
        this.querySelector('i').className = 'bi bi-display fs-5';
        showToast('Screen sharing stopped', 'info', 'bi-display');
    }
    updateStatusBadges();
};

// Layout Toggles
document.getElementById('participants-btn').onclick = function() {
    const panel = document.getElementById('participants-panel');
    panel.classList.toggle('d-none');
    panel.classList.toggle('d-flex');
    this.classList.toggle('active');
};

document.getElementById('close-participants').onclick = function() {
    const panel = document.getElementById('participants-panel');
    panel.classList.add('d-none');
    panel.classList.remove('d-flex');
    document.getElementById('participants-btn').classList.remove('active');
};

document.getElementById('chat-btn').onclick = function() {
    const chat = document.getElementById('chat-sidebar');
    // Toggle sidebar display
    if (chat.classList.contains('d-flex')) {
        chat.classList.replace('d-flex', 'd-none');
        this.classList.remove('active');
    } else {
        chat.classList.replace('d-none', 'd-flex');
        this.classList.add('active');
    }
};

document.getElementById('reactions-btn').onclick = function() {
    const popup = document.getElementById('reactions-popup');
    // Toggle
    if(popup.classList.contains('d-none')) {
        popup.classList.replace('d-none', 'd-flex');
    } else {
        popup.classList.replace('d-flex', 'd-none');
    }
};

function sendReaction(emoji) {
    if (navigator.vibrate) navigator.vibrate(100);
    document.getElementById('reactions-popup').classList.replace('d-flex', 'd-none');

    const reaction = document.createElement('div');
    reaction.className = 'floating-reaction';
    reaction.textContent = emoji;
    reaction.style.left = Math.random() * window.innerWidth + 'px';
    reaction.style.bottom = '100px';
    document.body.appendChild(reaction);
    setTimeout(() => reaction.remove(), 3000);
}

document.getElementById('end-call-btn').onclick = function() {
    if (confirm('Are you sure you want to leave the meeting?')) leaveAndRemoveLocalStream();
};

// --- Chat Logic ---
const chatSocket = new WebSocket('wss://' + window.location.host + '/ws/chat/' + CHANNEL + '/');

function formatTimestamp(dateString) {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function createMessageBubble(username, message, timestamp, isOwn = false) {
    const align = isOwn ? 'align-items-end' : 'align-items-start';
    const bubbleColor = isOwn ? 'bg-primary text-white rounded-bottom-0 rounded-start-3 rounded-top-3' : 'bg-secondary bg-opacity-25 text-white rounded-bottom-0 rounded-end-3 rounded-top-3';

    return `
        <div class="d-flex flex-column ${align} w-100">
            ${!isOwn ? `<div class="small fw-bold text-secondary px-1 mb-1" style="font-size: 12px;">${username}</div>` : ''}
            <div class="message-bubble p-2 px-3 shadow-sm ${bubbleColor}" style="word-wrap: break-word;">${message}</div>
            <div class="text-secondary mt-1 px-1" style="font-size: 10px;">${formatTimestamp(timestamp)}</div>
        </div>`;
}

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const chatLogs = document.querySelector('#chat-logs');

    if (data.type === 'history') {
        data.messages.forEach(msg => {
            const isOwn = msg.username === USERNAME;
            chatLogs.innerHTML += createMessageBubble(msg.username, msg.message, msg.created, isOwn);
        });
    } else if (data.type === 'chat') {
        const isOwn = data.username === USERNAME;
        chatLogs.innerHTML += createMessageBubble(data.username, data.message, null, isOwn);
        chatLogs.scrollTop = chatLogs.scrollHeight;
    } else if (data.type === 'video_participant') {
        if (data.uid === UID) return;
        participantNames[data.uid] = data.display_name || data.username;
        participantUsernames[data.uid] = data.username;
        const labelSpan = document.querySelector(`#display-name-${data.uid}`);
        if (labelSpan) labelSpan.textContent = data.display_name || data.username;
        updateParticipantsList();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const input = document.querySelector('#chat-message-input');
    const message = input.value.trim();
    if (message) {
        chatSocket.send(JSON.stringify({ 'type': 'chat', 'message': message, 'username': USERNAME }));
        input.value = '';
    }
};
document.querySelector('#chat-message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') document.querySelector('#chat-message-submit').click();
});

// Share Link
document.getElementById('share-link-btn').onclick = function() {
    const modal = new bootstrap.Modal(document.getElementById('shareLinkModal'));
    document.getElementById('meetingShareLink').value = window.location.href;
    modal.show();
};

function closeShareModal() {
    const el = document.getElementById('shareLinkModal');
    const modal = bootstrap.Modal.getInstance(el);
    if (modal) modal.hide();
}

function copyMeetingLink() {
    const input = document.getElementById('meetingShareLink');
    const button = document.querySelector('.share-copy-btn');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check-circle-fill"></i> Copied!';
        button.classList.replace('btn-primary', 'btn-success');
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.replace('btn-success', 'btn-primary');
        }, 2000);
    });
}

// Functions for editDisplayName and Leave... (kept mostly same logic)
function editDisplayName() {
    const newName = prompt('Enter your display name:', currentDisplayName);
    if (newName && newName.trim()) {
        currentDisplayName = newName.trim();
        document.getElementById('my-display-name').textContent = currentDisplayName;
        document.querySelector(`#display-name-${UID}`).textContent = currentDisplayName;
        chatSocket.send(JSON.stringify({'type': 'video_joined', 'username': USERNAME, 'uid': UID}));
        updateParticipantsList();
    }
}

let leaveAndRemoveLocalStream = async () => {
    for(let track of localTracks) { if(track) { track.stop(); track.close(); } }
    if (screenTrack) screenTrack.close();
    await client.leave();
    window.location.href = '/';
};


joinAndDisplayLocalStream();

});

