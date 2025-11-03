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

// 1. تهيئة PeerJS والحصول على الـ ID الخاص بك
statusMessage.textContent = "جاري تهيئة الاتصال...";

// PeerJS يستخدم سيرفر وسيط (Broker Server) مجاني لإدارة الاتصال
// هذا السيرفر هو الذي يسهل عملية الـ Handshake بينكم
peer = new Peer({
    host: 'peerjs-server.herokuapp.com', // سيرفر مجاني مقدم من PeerJS
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

// 2. الحصول على بث الكاميرا والميكروفون
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
    })
    .catch((err) => {
        console.error("لم يتم الحصول على الكاميرا والميكروفون:", err);
        statusMessage.textContent = "الرجاء السماح بالوصول للكاميرا والميكروفون للبدء.";
    });

// 3. استقبال مكالمة (الشخص الذي يتم الاتصال به)
peer.on('call', (call) => {
    // الرد على المكالمة بالبث المحلي
    call.answer(localStream);
    handleCall(call);
});

// 4. إجراء مكالمة (الشخص الذي يبدأ الاتصال)
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

// 5. وظيفة مشتركة لمعالجة المكالمة
function handleCall(call) {
    if (currentCall) {
        currentCall.close(); // إنهاء أي مكالمة سابقة
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
        // إعادة تهيئة بعد انتهاء المكالمة
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

// 6. إنهاء المكالمة
endCallButton.addEventListener('click', () => {
    if (currentCall) {
        currentCall.close();
    }
});