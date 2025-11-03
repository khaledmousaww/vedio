const myIdElement = document.getElementById('my-id');
const targetIdInput = document.getElementById('target-id');
const callButton = document.getElementById('call-button');
const endCallButton = document.getElementById('end-call-button');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const statusMessage = document.getElementById('status-message');

let peer = null;
let localStream = null;
let currentCall = null;

// 1. Initializing PeerJS and getting your ID
statusMessage.textContent = "جاري تهيئة الاتصال...";

// NOTE: We are changing the host to peerjs.net as the heroku server is often down.
peer = new Peer({
    key: 'peerjs',
    host: '0.peerjs.com',
    secure: true,
    port: 443
});

peer.on('open', (id) => {
    myIdElement.textContent = id;
    statusMessage.textContent = "الوضع: جاهز للاتصال. شارك الرمز أعلاه.";
});

peer.on('error', (err) => {
    console.error(err);
    statusMessage.textContent = خطأ في الاتصال: ${err.type};
});

// 2. Getting local camera and microphone stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
    })
    .catch((err) => {
        console.error("Failed to get media devices:", err);
        statusMessage.textContent = "الرجاء السماح بالوصول للكاميرا والميكروفون للبدء.";
    });

// 3. Handling incoming calls
peer.on('call', (call) => {
    call.answer(localStream);
    handleCall(call);
});

// 4. Making an outgoing call
callButton.addEventListener('click', () => {
    const targetId = targetIdInput.value.trim();
    if (!targetId || !localStream) {
        alert("الرجاء إدخال رمز الطرف الآخر والسماح للكاميرا!");
        return;
    }

    statusMessage.textContent = جاري الاتصال بـ ${targetId}...;
    const call = peer.call(targetId, localStream);
    handleCall(call);
});

// 5. Shared function to handle the call process
function handleCall(call) {
    if (currentCall) {
        currentCall.close(); 
    }
    currentCall = call;

    callButton.disabled = true;
    endCallButton.disabled = false;
    statusMessage.textContent = "تم الاتصال! جاري استقبال الفيديو...";

    call.on('stream', (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
        statusMessage.textContent = "المكالمة مستمرة بنجاح.";
    });

    call.on('close', () => {
        // Reset state after call ends
        remoteVideo.srcObject = null;
        callButton.disabled = false;
        endCallButton.disabled = true;
        statusMessage.textContent = "تم إنهاء المكالمة. جاهز لاتصال جديد.";
    });

    call.on('error', (err) => {
        console.error("خطأ في المكالمة:", err);
        statusMessage.textContent = "حدث خطأ أثناء المكالمة.";
    });
}

// 6. Ending the call
endCallButton.addEventListener('click', () => {
    if (currentCall) {
        currentCall.close();
    }
});

