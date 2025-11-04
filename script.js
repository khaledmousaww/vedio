const myIdElement = document.getElementById('my-id');
const targetIdInput = document.getElementById('target-id');
const callButton = document.getElementById('call-button');
const endCallButton = document.getElementById('end-call-button');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const statusMessage = document.getElementById('status-message');

let peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true
});

let localStream = null;
let currentCall = null;

peer.on('open', id => {
    myIdElement.textContent = id;
    statusMessage.textContent = "الوضع: جاهز للاتصال. شارك الرمز أعلاه.";
});

peer.on('error', err => {
    console.error(err);
    statusMessage.textContent = خطأ في الاتصال: ${err.type || err};
});

// جلب الكاميرا والميكروفون
async function initMedia() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevice = devices.find(d => d.kind === 'videoinput');

        if (!videoDevice) {
            statusMessage.textContent = "لا توجد كاميرا متصلة!";
            return;
        }

        localStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: videoDevice.deviceId },
            audio: true
        });

        localVideo.srcObject = localStream;
    } catch (err) {
        console.error(err);
        statusMessage.textContent = "الرجاء السماح بالكاميرا والميكروفون!";
    }
}

initMedia();

peer.on('call', call => {
    call.answer(localStream);
    handleCall(call);
});

callButton.addEventListener('click', () => {
    const targetId = targetIdInput.value.trim();
    if (!targetId || !localStream) {
        alert("ادخل الرمز وأعطِ السماح بالكاميرا!");
        return;
    }
    const call = peer.call(targetId, localStream);
    handleCall(call);
});

endCallButton.addEventListener('click', () => {
    if (currentCall) currentCall.close();
});

function handleCall(call) {
    if (currentCall) currentCall.close();
    currentCall = call;

    callButton.disabled = true;
    endCallButton.disabled = false;
    statusMessage.textContent = "تم الاتصال! جاري استقبال الفيديو...";

    call.on('stream', stream => {
        remoteVideo.srcObject = stream;
    });

    call.on('close', () => {
        remoteVideo.srcObject = null;
        callButton.disabled = false;
        endCallButton.disabled = true;
        statusMessage.textContent = "تم إنهاء المكالمة. جاهز لاتصال جديد.";
    });

    call.on('error', err => {
        console.error("خطأ في المكالمة:", err);
        statusMessage.textContent = "حدث خطأ أثناء المكالمة.";
    });
}
