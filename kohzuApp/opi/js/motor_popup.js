        const MotorPopup = {
            handleFileUpload(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const configData = JSON.parse(e.target.result);

                        document.getElementById('modal-stage-badge').innerText = configData.stageModel || "Unknown";

                        const specsList = document.getElementById('modal-specs-list');
                        if (configData.specifications) {
                            specsList.innerHTML = Object.entries(configData.specifications)
                                .map(([k, v]) => `<div class="flex justify-between border-b border-slate-700/50 pb-1.5"><span class="text-slate-500 font-bold tracking-tight">${k}</span><span class="text-slate-200 text-right font-semibold">${v}</span></div>`)
                                .join('');
                        } else {
                            specsList.innerHTML = '<div class="text-slate-600 italic text-center py-4">No specifications found</div>';
                        }

                        const driverList = document.getElementById('modal-driver-list');
                        if (configData.driverSettings) {
                            driverList.innerHTML = Object.entries(configData.driverSettings)
                                .map(([k, v]) => `<div class="flex justify-between border-b border-slate-700/50 pb-1.5"><span class="text-slate-500 font-bold tracking-tight">${k}</span><span class="text-slate-300 text-right font-mono">${v}</span></div>`)
                                .join('');
                        } else {
                            driverList.innerHTML = '<div class="text-slate-600 text-center py-2">No driver settings</div>';
                        }

                        // Optionally mock update inputs for preview
                        if (configData.parameters) {
                            for (const [key, val] of Object.entries(configData.parameters)) {
                                const input = document.querySelector(`[data-pv$=".${key}"]`);
                                if (input && input.tagName !== 'DIV' && input.tagName !== 'SPAN') {
                                    input.value = val;
                                } else if (input) {
                                    input.innerText = val;
                                }
                            }
                        }
                    } catch (err) {
                        alert('Invalid JSON file.');
                        console.error(err);
                    }
                };
                reader.readAsText(file);
                event.target.value = '';
            },

            bindGlobalEvents() {
                document.addEventListener('click', (event) => {
                    const allStopButton = event.target.closest('#all-stop-btn');
                    if (allStopButton) {
                        event.preventDefault();
                        if (typeof app !== 'undefined' && app.writePrefix) {
                            app.writePrefix('allstop.VAL', 1);
                        }
                    }
                });
            }
        };

        // Maintain backward compatibility
        function handleFileUpload(event) {
            MotorPopup.handleFileUpload(event);
        }

        MotorPopup.bindGlobalEvents();
