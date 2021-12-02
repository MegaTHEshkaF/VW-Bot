function showError() {
    const input = document.getElementById('domain');
    const errorText = document.getElementById('errorText');

    input.classList.add("error");
    errorText.classList.remove('hidden');
}

function showSuccess() {
    const successText = document.getElementById('successText');

    successText.classList.remove('hidden');
}