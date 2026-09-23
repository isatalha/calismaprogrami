document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const girilenIsim = document.getElementById('name').value.trim();
    const girilenSifre = document.getElementById('password').value.trim();

    if ((girilenIsim === "Ateş" && girilenSifre === "61728394") || 
        (girilenIsim === "Elektra" && girilenSifre === "Elektra4242")) {
        
        localStorage.setItem("aktifKullanici", girilenIsim);
        window.location.href = "panel.html";
    } else {
        alert("İsim veya şifre hatalı!");
    }
});
