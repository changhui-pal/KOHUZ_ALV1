        // Standalone preview script for motor_popup.html
        function handleFileUpload(event) {
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
                            // Find the correct matching inputs by ID/Name or CSS selector mapped for motor_popup.html
                            // note that in motor_popup.html elements exist as `data-pv="$(P)$(M)..."` 
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
        }
