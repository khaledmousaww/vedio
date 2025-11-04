const myIdElement = document.getElementById('my-id');
const targetIdInput = document.getElementById('target-id');
const callButton = document.getElementById('call-button');
const endCallButton = document.getElementById('end-call-button');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const statusMessage = document.getElementById('status-message');

let peer = new Peer({
    host: 'localhost',
    port: 9000,
    path: '/',
    secure: false
});

let localStream = null;
let currentCall = null;

// الحصول على الـ ID
peer.on('open', id => {
    myIdElement.textContent = id;
    statusMessage.textContent = "الوضع: جاهز للاتصال. شارك الرمز أعلاه.";
});

// الحصول على الميديا
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
})
.catch(err => {
    statusMessage.textContent = "الرجاء السماح بالكاميرا والميكروفون!";
});

// استقبال المكالمات
peer.on('call', call => {
    call.answer(localStream);
    handleCall(call);
});

// عمل مكالمة
callButton.addEventListener('click', () => {
    const targetId = targetIdInput.value.trim();
    if (!targetId) return alert("ادخل الرمز!");
    const call = peer.call(targetId, localStream);
    handleCall(call);
});

// إنهاء المكالمة
endCallButton.addEventListener('click', () => {
    if (currentCall) currentCall.close();
});

// دالة إدارة المكالمة
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
}