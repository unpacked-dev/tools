(function run() {
    update_clock();
    setTimeout(run, 1000);
})();

function update_clock() {
    const timestamp = Date.now();
    const seconds = Math.round(timestamp / 1000);
    clock.innerHTML = seconds;
}

clock.addEventListener('click', () => {
    navigator.clipboard.writeText(clock.innerHTML);
});