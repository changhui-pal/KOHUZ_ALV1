        const wsHost = window.location.hostname || 'localhost';
        const wsPort = window.location.port ? window.location.port : '8888';
        const wsUrl = `ws://${wsHost}:${wsPort}/ws`;

        const axesConfig = [null, null, null, null, null, null];
        const PREFIX = 'KOHZU:';
        let currentModalAxis = null;
        let motorPopupTemplate = null;

        function toggleCollapse(btn) {
            const card = btn.closest('.card');
            if (card) {
                card.classList.toggle('collapsed');
            }
        }

        // Core motor suffixes to track and save (excluding movement-triggering PVs like .VAL)
        const CORE_PV_SUFFIXES = [
            ".DESC", ".EGU", ".HLM", ".LLM", ".TWV",
            ".SET", ".OFF", ".FOFF", ".DIR",
            ".VMAX", ".VELO", ".VBAS", ".ACCL",
            ".BDST", ".BVEL", ".BACC", ".FRAC",
            ".JVEL", ".JAR", ".HVEL", ":HomingMethod",
            ".PCOF", ".ICOF", ".DCOF",
            ".CNEN", ".SPMG",
            ".MRES", ".ERES", ".RRES", ".RDBD", ".RTRY",
            ".UEIP", ".URIP", ".DLY", ".PREC",
            ".PREM", ".POST"
        ];

        // Populate Axes Grid
        function renderDashboard() {
            const container = document.getElementById('axes-container');
            container.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                const idx = i;
                const pvPrefix = `${PREFIX}m${idx + 1}`;

                // Readback and status
                const modelInfo = axesConfig[idx]
                    ? `<span class="px-2 py-0.5 rounded text-[10px] bg-blue-900/50 text-blue-300 border border-blue-800">${axesConfig[idx].stageModel}</span>`
                    : `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-500 border border-slate-700">No Config</span>`;

                const cardHtml = `
                <div class="card axis-card card-responsive flex flex-col justify-between" id="axis-card-${idx}">
                    <!-- 카드 헤더 (Card Header) -->
                    <div class="card-header flex justify-between items-center border-b border-slate-700/50 pb-2 mb-1">
                        <div class="flex items-center gap-2">
                            <span class="card-title text-sm whitespace-nowrap">Motor ${idx + 1}</span>
                            ${modelInfo}
                        </div>
                        <!-- 헤더 우측 이동: 구동기 타입 라벨, 이동 상태 배지 -->
                        <div class="flex items-center gap-1.5 ml-auto">
                            <span class="truncate text-[9px] text-slate-600 bg-black px-1 rounded border border-slate-800" data-pv="${pvPrefix}.DTYP" title="DTYP">Type</span>
                            <div id="axis-movn-status-${idx}" class="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-500 border border-slate-700">IDLE</div>
                            <span data-pv="${pvPrefix}.MOVN" class="hidden"></span>
                            <div id="axis-conn-${idx}" class="w-2 h-2 rounded-full bg-slate-600 shadow-sm ml-1" title="Disconnected"></div>
                            
                            <button onclick="openModal(${idx}); event.stopPropagation();" class="text-slate-500 hover:text-blue-400 transition-colors ml-1 p-0.5 rounded hover:bg-slate-700/50" title="Detailed Settings">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>

                            <button onclick="toggleCollapse(this); event.stopPropagation();" class="collapse-btn text-slate-500 hover:text-white transition-colors ml-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body flex-1 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 p-3 min-h-[170px] overflow-x-auto min-w-0">
                        <!-- 1열 데이터 영역 -->
                        <div class="flex flex-col gap-1.5 shrink-0 lg:border-r border-slate-700/30 lg:pr-2 pb-2 lg:pb-0 border-b lg:border-b-0">
                            <!-- 데이터 열 헤더 -->
                            <div class="grid grid-cols-[60px_80px_80px_24px] gap-2 items-center text-center pb-1 border-b border-slate-700/30">
                                <div class="text-[11px] font-bold text-slate-400 uppercase text-left">
                                    <span class="truncate max-w-[60px] inline-block" data-pv="${pvPrefix}.DESC" title="Description">Desc</span>
                                </div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase">User</div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase">Dial</div>
                                <div class="text-[9px] font-bold text-slate-500 uppercase pr-1">Lmt</div>
                            </div>

                            <!-- 1행: Hi limit -->
                            <div class="grid grid-cols-[60px_80px_80px_24px] gap-2 items-center">
                                <div class="text-[11px] font-bold text-slate-400 text-right pr-1">Hi limit</div>
                                <input type="number" data-pv="${pvPrefix}.HLM" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right" onclick="event.stopPropagation()">
                                <input type="number" data-pv="${pvPrefix}.DHLM" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right text-slate-500" onclick="event.stopPropagation()">
                                <div class="flex justify-center">
                                    <div class="led w-2.5 h-2.5" data-led-pv="${pvPrefix}.HLS" data-led-on="1" data-led-color="error"></div>
                                </div>
                            </div>

                            <!-- 2행: Readback -->
                            <div class="grid grid-cols-[60px_80px_80px_24px] gap-2 items-center">
                                <div class="text-[11px] font-bold text-green-500 text-right pr-1">Readback</div>
                                <div class="w-[80px] h-[22px] bg-slate-900 border border-slate-700 rounded px-1.5 text-right flex justify-end items-center overflow-hidden">
                                    <span data-pv="${pvPrefix}.RBV" class="pv-font text-green-400 font-bold text-xs leading-none tabular-nums pr-3">0.0000</span>
                                </div>
                                <div class="w-[80px] h-[22px] bg-slate-900 border border-slate-700 rounded px-1.5 text-right flex justify-end items-center overflow-hidden">
                                    <span data-pv="${pvPrefix}.DRBV" class="pv-font text-green-400/70 font-bold text-xs leading-none tabular-nums pr-3">0.0000</span>
                                </div>
                                <div class="flex justify-center items-center">
                                    <span data-pv="${pvPrefix}.EGU" class="text-[8px] font-bold text-slate-500 pv-font px-0.5" title="EGU">EGU</span>
                                </div>
                            </div>

                            <!-- 3행: Drive -->
                            <div class="grid grid-cols-[60px_80px_80px_24px] gap-2 items-center">
                                <div class="text-[11px] font-bold text-blue-400 text-right pr-1">Drive</div>
                                <input type="number" data-pv="${pvPrefix}.VAL" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right text-white font-bold" onclick="event.stopPropagation()">
                                <input type="number" data-pv="${pvPrefix}.DVAL" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right text-slate-500" onclick="event.stopPropagation()">
                                <div class="flex flex-col items-center justify-center -space-y-0.5">
                                    <div class="text-[6px] text-slate-400 font-bold uppercase leading-tight mb-0.5">MOVing</div>
                                    <div class="led w-2.5 h-2.5" data-led-pv="${pvPrefix}.DMOV" data-led-on="0" data-led-color="on"></div>
                                </div>
                            </div>

                            <!-- 4행: Lo limit -->
                            <div class="grid grid-cols-[60px_80px_80px_24px] gap-2 items-center">
                                <div class="text-[11px] font-bold text-slate-400 text-right pr-1">Lo limit</div>
                                <input type="number" data-pv="${pvPrefix}.LLM" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right" onclick="event.stopPropagation()">
                                <input type="number" data-pv="${pvPrefix}.DLLM" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right text-slate-500" onclick="event.stopPropagation()">
                                <div class="flex justify-center">
                                    <div class="led w-2.5 h-2.5" data-led-pv="${pvPrefix}.LLS" data-led-on="1" data-led-color="error"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 2열 미세 이동 조작 (Tweak) -->
                        <div class="flex flex-col justify-center gap-2 lg:pl-2">
                            <div class="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest mb-1 border-b border-slate-700/30 pb-1">Tweak Control</div>
                            
                            <!-- 1행 (<, TWV, >) -->
                            <div class="grid grid-cols-[1fr_80px_1fr] gap-1.5 items-center justify-center w-full">
                                <button onclick="app.write('${pvPrefix}.TWR', 1); event.stopPropagation();" class="w-full text-xs font-bold py-1 px-2 rounded border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors shadow-sm text-center">&lt;</button>
                                <input type="number" data-pv="${pvPrefix}.TWV" class="w-[80px] h-[22px] input-dark-tab px-1.5 py-0.5 text-xs text-right mx-auto border border-slate-700 focus:border-blue-500" onclick="event.stopPropagation()">
                                <button onclick="app.write('${pvPrefix}.TWF', 1); event.stopPropagation();" class="w-full text-xs font-bold py-1 px-2 rounded border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors shadow-sm text-center">&gt;</button>
                            </div>
                            
                            <!-- 2행 (Go-, STOP, Go+) -->
                            <div class="grid grid-cols-[1fr_1fr_1fr] gap-1.5 items-center mt-1 w-full">
                                <button onclick="app.write('${pvPrefix}.JOGR', 1); event.stopPropagation();" onmouseup="app.write('${pvPrefix}.JOGR', 0)" class="w-full text-xs font-bold py-1 px-2 rounded border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors uppercase shadow-sm">Go-</button>
                                <button onclick="app.write('${pvPrefix}.STOP', 1); event.stopPropagation();" class="w-full text-[10px] font-black py-1 px-2 rounded border border-yellow-700 bg-yellow-600 hover:bg-yellow-500 text-slate-900 transition-colors shadow-sm uppercase text-center">STOP</button>
                                <button onclick="app.write('${pvPrefix}.JOGF', 1); event.stopPropagation();" onmouseup="app.write('${pvPrefix}.JOGF', 0)" class="w-full text-xs font-bold py-1 px-2 rounded border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors uppercase shadow-sm">Go+</button>
                            </div>
                        </div>

                        <!-- Hidden MSTA for hardware health monitoring -->
                        <div class="hidden" data-pv="${pvPrefix}.MSTA"></div>
                    </div>
                </div>
                `;
                container.innerHTML += cardHtml;
            }

            // Need to re-bind elements if app is running
            if (app.ws && app.ws.readyState === WebSocket.OPEN) {
                app.bindDOM();
            }
        }

        // 서버 stages/ 디렉토리에서 파일 목록을 가져와 드롭다운에 채움
        function populateStageDropdown() {
            fetch('/api/stages')
                .then(r => r.json())
                .then(files => {
                    const select = document.getElementById('modal-stage-select');
                    if (!select) return;
                    select.innerHTML = '<option value="">Select Stage...</option>';
                    files.forEach(f => {
                        const opt = document.createElement('option');
                        opt.value = f;
                        opt.textContent = f.replace('.json', '');
                        select.appendChild(opt);
                    });
                })
                .catch(err => console.error('Failed to load stage list:', err));
        }

        // 서버의 stages/ 파일을 fetch하여 적용
        function loadServerStage(filename) {
            if (!filename || currentModalAxis === null) return;
            const axisIndex = currentModalAxis;
            const pvPrefix = `${PREFIX}m${axisIndex + 1}`;

            fetch(`/stages/${filename}`)
                .then(r => r.json())
                .then(configData => {
                    axesConfig[axisIndex] = configData;

                    // EPICS 파라미터 전송
                    const p = configData.parameters;
                    if (p) {
                        const keys = Object.keys(p);
                        console.log(`[Server Stage] ${filename}: ${keys.length} parameters`, keys);
                        for (const [key, val] of Object.entries(p)) {
                            app.write(`${pvPrefix}.${key}`, val);
                        }
                    }

                    alert(`Applied: ${configData.stageModel} → Motor ${axisIndex + 1}`);
                    renderDashboard();
                    saveAppState();

                    // 모달 즉시 갱신
                    const stageBadge = document.getElementById('modal-stage-badge');
                    if (stageBadge) stageBadge.innerText = configData.stageModel || "Unknown";

                    const specsList = document.getElementById('modal-specs-list');
                    if (specsList && configData.specifications) {
                        specsList.innerHTML = Object.entries(configData.specifications)
                            .map(([k, v]) => `<div class="flex justify-between items-center px-2 py-1 border-b border-slate-700/30"><span class="text-xs text-slate-400 font-bold">${k}</span><span class="text-xs text-slate-200 text-right font-bold">${v}</span></div>`)
                            .join('');
                    }

                    const driverList = document.getElementById('modal-driver-list');
                    if (driverList && configData.driverSettings) {
                        driverList.innerHTML = Object.entries(configData.driverSettings)
                            .map(([k, v]) => `<div class="flex justify-between items-center px-2 py-1 border-b border-slate-700/30"><span class="text-xs text-slate-400 font-bold">${k}</span><span class="text-xs text-slate-300 text-right font-mono font-bold">${v}</span></div>`)
                            .join('');
                    }

                    // 모달 내 입력 필드 갱신
                    if (p) {
                        const modal = document.getElementById('detail-modal');
                        modal.querySelectorAll('[data-actual-pv]').forEach(el => {
                            const actualPv = el.getAttribute('data-actual-pv');
                            for (const [key, val] of Object.entries(p)) {
                                if (actualPv === `${pvPrefix}.${key}`) {
                                    if (el.tagName === 'INPUT') el.value = val;
                                    else if (el.tagName === 'SELECT') el.value = val;
                                    else if (el.tagName !== 'BUTTON') el.innerText = val;
                                }
                            }
                        });
                    }
                })
                .catch(err => {
                    alert(`Failed to load ${filename}`);
                    console.error(err);
                });
        }


        function saveAppState() {
            const state = {
                axesConfig: axesConfig,
                sequenceSteps: sequenceSteps,
                notepad: document.getElementById('notepad')?.value || ""
            };
            localStorage.setItem('kohzu_app_state', JSON.stringify(state));
        }

        function loadAppState() {
            const saved = localStorage.getItem('kohzu_app_state');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    if (state.axesConfig) {
                        for (let i = 0; i < 6; i++) axesConfig[i] = state.axesConfig[i] || null;
                    }
                    if (state.sequenceSteps) sequenceSteps = state.sequenceSteps;
                    if (state.notepad !== undefined && document.getElementById('notepad')) {
                        document.getElementById('notepad').value = state.notepad;
                    }
                    console.log("[AppState] Restored from localStorage");
                } catch (e) {
                    console.error("Failed to load app state", e);
                }
            }
        }


        async function openModal(idx) {
            currentModalAxis = idx;
            const pvPrefix = `${PREFIX}m${idx + 1}`;

            document.getElementById('modal-axis-title').innerText = `Motor ${idx + 1} (${pvPrefix})`;

            const badge = document.getElementById('modal-model-badge');
            if (axesConfig[idx]) {
                badge.innerText = axesConfig[idx].stageModel;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }

            // Load template if not loaded
            if (!motorPopupTemplate) {
                try {
                    const r = await fetch('motor_popup.html');
                    const html = await r.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const mainContent = doc.querySelector('main');
                    motorPopupTemplate = mainContent ? mainContent.innerHTML : html;
                } catch (e) {
                    console.error("Failed to load template", e);
                    alert("Failed to load modal template.");
                    return;
                }
            }

            const container = document.getElementById('modal-content-container');
            if (container) {
                container.innerHTML = motorPopupTemplate.replaceAll('$(P)$(M)', pvPrefix);
            }

            const modal = document.getElementById('detail-modal');

            // Render Specs and Driver Settings if present in config
            const specsList = document.getElementById('modal-specs-list');
            const driverList = document.getElementById('modal-driver-list');
            const stageBadge = document.getElementById('modal-stage-badge');

            if (axesConfig[idx]) {
                stageBadge.innerText = axesConfig[idx].stageModel || "Unknown";

                if (axesConfig[idx].specifications) {
                    specsList.innerHTML = Object.entries(axesConfig[idx].specifications)
                        .map(([k, v]) => `<div class="flex justify-between items-center px-2 py-1 border-b border-slate-700/30"><span class="text-xs text-slate-400 font-bold">${k}</span><span class="text-xs text-slate-200 text-right font-bold">${v}</span></div>`)
                        .join('');
                } else {
                    specsList.innerHTML = '<div class="text-slate-600 italic text-center py-4">No specifications found</div>';
                }

                if (axesConfig[idx].driverSettings) {
                    driverList.innerHTML = Object.entries(axesConfig[idx].driverSettings)
                        .map(([k, v]) => `<div class="flex justify-between items-center px-2 py-1 border-b border-slate-700/30"><span class="text-xs text-slate-400 font-bold">${k}</span><span class="text-xs text-slate-300 text-right font-mono font-bold">${v}</span></div>`)
                        .join('');
                } else {
                    driverList.innerHTML = '<div class="text-slate-600 text-center py-2">No driver settings</div>';
                }
            } else {
                stageBadge.innerText = "No Stage Selected";
                specsList.innerHTML = '<div class="text-slate-600 italic text-center py-8">Please select a stage configuration file to view specifications.</div>';
                driverList.innerHTML = '';
            }

            modal.classList.remove('hidden');

            // 서버 stage 파일 목록 로드
            populateStageDropdown();

            // Let the controller rescan and subscribe
            app.bindDOM();
        }

        function handleFileUpload(event, axisIdx) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const configData = JSON.parse(e.target.result);
                    axesConfig[axisIdx] = configData;

                    // Immediately re-open the modal to trigger full re-render of specs/driver settings
                    if (currentModalAxis === axisIdx) {
                        openModal(axisIdx);
                    }
                    saveAppState();

                    // Upload via API
                    fetch('/api/stages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            filename: file.name,
                            data: configData
                        })
                    }).then(res => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.json();
                    }).then(data => {
                        console.log('Upload successful:', data);
                        populateStageDropdown(); // Refresh the list
                    }).catch(err => {
                        console.error('Upload failed:', err);
                        alert('Upload server sync failed: ' + err.message);
                    });

                } catch (err) {
                    alert('Invalid JSON file.');
                    console.error(err);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        function closeModal() {
            document.getElementById('detail-modal').classList.add('hidden');
            currentModalAxis = null;

            // Clean up modal bindings to prevent updates for closed modal?
            // Optionally, but WS overhead for 1 off axis isn't much.
            // But we will rebind DOM to make sure we don't have duplicated data-actua-pv mismatch 
            // Better to remove data-actual-pv from modal
            const modal = document.getElementById('detail-modal');
            modal.querySelectorAll('[data-actual-pv]').forEach(el => {
                el.removeAttribute('data-actual-pv');
                el.removeAttribute('data-pv');
                el.removeAttribute('data-led-pv');
                el.removeAttribute('data-tooltip-pv');
            });
        }


        class EPICSController {
            constructor() {
                this.ws = null;
                this.pvs = new Set();
                this.valueCache = {}; // Global cache for all received PV values
                this.domElements = [];
                this.init();
            }

            init() {
                this.ws = new WebSocket(wsUrl);
                this.ws.onopen = () => this.onOpen();
                this.ws.onmessage = (e) => this.onMessage(JSON.parse(e.data));
                this.ws.onclose = () => {
                    this.updateStatus(false);
                    setTimeout(() => this.init(), 3000);
                };
                this.ws.onerror = (e) => console.error(e);
            }

            onOpen() {
                this.updateStatus(true);
                this.subscribeCorePVs(); // Ensure we track important PVs for all axes on startup
                this.bindDOM();
            }

            subscribeCorePVs() {
                const corePvs = [];
                for (let i = 1; i <= 6; i++) {
                    const motorPrefix = `${PREFIX}m${i}`;
                    CORE_PV_SUFFIXES.forEach(suffix => {
                        corePvs.push(motorPrefix + suffix);
                    });
                }
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'subscribe', pvs: corePvs }));
                }
            }

            bindDOM() {
                this.pvs.clear();

                // Clear old tooltips
                document.querySelectorAll('.pv-tooltip').forEach(e => e.remove());

                // Scan all PV tagged elements
                document.querySelectorAll('[data-pv], [data-led-pv], [data-tooltip-pv]').forEach(el => {
                    // Skip if hidden inside modal and NO actual data-pv?
                    // Actually templates don't have data-pv until openModal sets them!
                    // So we can safely bind any element that matched the querySelector.
                    let resolved = el.getAttribute('data-pv') || el.getAttribute('data-led-pv') || el.getAttribute('data-tooltip-pv');
                    if (!resolved) return;

                    el.setAttribute('data-actual-pv', resolved);

                    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
                        el.onchange = (e) => this.write(resolved, el.type === 'number' ? parseFloat(e.target.value) : e.target.value);
                    }

                    this.pvs.add(resolved);

                    // Re-bind tooltips
                    el.setAttribute('title', resolved); // Built-in tooltip fallback
                    if (!el.hasAttribute('data-tooltip-bound')) {
                        el.setAttribute('data-tooltip-bound', 'true');
                        let tooltipTimeout;
                        let tooltipEl = null;

                        el.addEventListener('mouseenter', () => {
                            tooltipTimeout = setTimeout(() => {
                                tooltipEl = document.createElement('div');
                                tooltipEl.className = 'pv-tooltip';
                                tooltipEl.innerText = el.getAttribute('data-actual-pv');
                                el.appendChild(tooltipEl);
                                void tooltipEl.offsetWidth;
                                tooltipEl.classList.add('show');
                            }, 1000);
                        });

                        el.addEventListener('mouseleave', () => {
                            clearTimeout(tooltipTimeout);
                            if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
                        });
                    }
                });

                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'subscribe', pvs: Array.from(this.pvs) }));
                }
            }

            updateStatus(connected) {
                const el = document.getElementById('conn-status');
                if (connected) {
                    el.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/50 text-green-300 text-xs font-semibold border border-green-800";
                    el.innerHTML = '<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>Connected';
                } else {
                    el.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/50 text-red-300 text-xs font-semibold border border-red-800";
                    el.innerHTML = '<div class="w-2 h-2 rounded-full bg-red-500"></div>Disconnected';
                }
            }

            onMessage(data) {
                if (data.type === 'connection' && data.pv.endsWith('.RBV')) {
                    const match = data.pv.match(/KOHZU:m(\d+)/);
                    if (match) {
                        const axisIdx = parseInt(match[1]) - 1;
                        const indicator = document.getElementById(`axis-conn-${axisIdx}`);
                        if (indicator) {
                            const card = document.getElementById(`axis-card-${axisIdx}`);
                            if (data.connected) {
                                // Initial connection - we don't know MSTA yet, so default to green if not grayed out
                                // But better to wait for MSTA update
                                indicator.className = "w-2 h-2 rounded-full bg-green-500 ml-auto shadow-[0_0_8px_#22c55e]";
                                indicator.title = "IOC Connected (Waiting for MSTA)";
                            } else {
                                indicator.className = "w-2 h-2 rounded-full bg-slate-600 ml-auto shadow-sm";
                                indicator.title = "IOC Disconnected";
                                if (card) card.classList.add('disconnected-card');
                            }
                        }
                    }
                    return;
                }

                if (data.type === 'update' && data.pv.endsWith('.MSTA')) {
                    const match = data.pv.match(/KOHZU:m(\d+)/);
                    if (match) {
                        const axisIdx = parseInt(match[1]) - 1;
                        const card = document.getElementById(`axis-card-${axisIdx}`);
                        const indicator = document.getElementById(`axis-conn-${axisIdx}`);
                        const isProblem = (data.value & 512) !== 0; // Bit 9: RA_PROBLEM

                        if (isProblem) {
                            if (card) card.classList.add('disconnected-card');
                            if (indicator) {
                                indicator.className = "w-2 h-2 rounded-full bg-red-500 ml-auto shadow-[0_0_8px_#ef4444]";
                                indicator.title = "Hardware Problem / Not Connected";
                            }
                        } else {
                            if (card) card.classList.remove('disconnected-card');
                            if (indicator) {
                                indicator.className = "w-2 h-2 rounded-full bg-green-500 ml-auto shadow-[0_0_8px_#22c55e]";
                                indicator.title = "Connected";
                            }
                        }

                        // Update MSTA bit LEDs in modal if open
                        if (currentModalAxis === axisIdx) {
                            document.querySelectorAll('[data-msta-bit]').forEach(el => {
                                const bit = parseInt(el.getAttribute('data-msta-bit'));
                                const colorClass = el.getAttribute('data-led-color') || 'on';
                                if ((data.value & (1 << bit)) !== 0) {
                                    el.classList.add(colorClass);
                                } else {
                                    el.classList.remove('on', 'warn', 'error');
                                }
                            });
                        }
                    }
                    return;
                }

                if (data.type !== 'update') return;

                // Update global cache
                this.valueCache[data.pv] = data.value;

                document.querySelectorAll(`[data-actual-pv="${data.pv}"]`).forEach(el => {
                    if (el.classList.contains('led')) {
                        const targetVal = el.getAttribute('data-led-on') || "1";
                        if (String(data.value) == targetVal) {
                            el.classList.add(el.getAttribute('data-led-color') || 'on');
                        } else {
                            el.classList.remove('on', 'warn', 'error');
                        }
                        return;
                    }

                    if (el.hasAttribute('data-active-val')) {
                        const activeVal = el.getAttribute('data-active-val');
                        if (String(data.value) === activeVal) {
                            el.classList.add('!bg-green-700', '!border-green-600', '!text-white');
                        } else {
                            el.classList.remove('!bg-green-700', '!border-green-600', '!text-white');
                        }

                        // 버튼 태그인 경우 텍스트(0, 1)로 덮어쓰지 않도록 종료
                        if (el.tagName === 'BUTTON') return;
                    }

                    if (el.tagName === 'INPUT') {
                        if (document.activeElement !== el) el.value = data.value;
                    } else if (el.tagName === 'SELECT') {
                        el.value = data.value;
                    } else {
                        if (el.hasAttribute('data-tooltip-pv') && !el.hasAttribute('data-pv')) return;

                        let val = data.value;
                        if (typeof val === 'number') val = val.toFixed(4).replace(/\.?0+$/, '');
                        el.innerText = val;
                    }
                });

                // Check for dynamic overlay updates from Motor X
                if (data.pv.endsWith('.MOVN')) {
                    const match = data.pv.match(/KOHZU:m(\d+)/);
                    if (match) {
                        const axisIdx = parseInt(match[1]) - 1;

                        // Update on main dashboard card
                        const cardMovn = document.getElementById(`axis-movn-status-${axisIdx}`);
                        if (cardMovn) {
                            cardMovn.innerText = data.value ? "MOVING" : "IDLE";
                            cardMovn.className = data.value
                                ? "px-2 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white animate-pulse"
                                : "px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-500 border border-slate-700";
                        }

                        // Update in modal if open for this axis
                        if (currentModalAxis === axisIdx) {
                            const overlay = document.getElementById('moving-overlay');
                            const statusDiv = document.getElementById('status-movn');
                            if (overlay) overlay.style.opacity = data.value ? "1" : "0";
                            if (statusDiv) {
                                statusDiv.innerText = data.value ? "MOVING" : "IDLE";
                                statusDiv.className = data.value
                                    ? "px-3 py-1 rounded text-xs font-bold bg-blue-600 text-white animate-pulse"
                                    : "px-3 py-1 rounded text-xs font-bold bg-slate-700 text-slate-400";
                            }
                        }
                    }
                }
            }

            write(pv, value) {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'write', pv, value }));
                }
            }

            writePrefix(suffix, value) {
                if (currentModalAxis !== null) {
                    const pv = `${PREFIX}m${currentModalAxis + 1}${suffix}`;
                    this.write(pv, value);
                } else if (suffix.startsWith('allstop')) {
                    // Special case: all axis stop
                    this.write(`${PREFIX}${suffix}`, value);
                }
            }

            writeInputPrefix(suffix) {
                if (currentModalAxis !== null) {
                    const pv = `${PREFIX}m${currentModalAxis + 1}${suffix}`;
                    const el = document.querySelector(`input[data-actual-pv="${pv}"]`);
                    if (el) this.write(pv, parseFloat(el.value));
                }
            }

            abortAll() {
                for (let i = 1; i <= 6; i++) {
                    this.write(`${PREFIX}m${i}.STOP`, 1);
                }
            }
        }

        // Init UI
        const app = new EPICSController();
        loadAppState();
        renderDashboard();

        // Setup Charts
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    display: false,
                    grid: { color: '#1e293b', display: false },
                    ticks: { color: '#475569', font: { size: 9 }, maxRotation: 0 }
                },
                y: {
                    display: true,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8', font: { size: 9 } }
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#cbd5e1', font: { size: 9 }, boxWidth: 8, padding: 4 }
                }
            }
        };

        const chartDatasetsTemplate = [
            { label: 'M1', data: Array(30).fill(null), borderColor: '#ef4444', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
            { label: 'M2', data: Array(30).fill(null), borderColor: '#f97316', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
            { label: 'M3', data: Array(30).fill(null), borderColor: '#eab308', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
            { label: 'M4', data: Array(30).fill(null), borderColor: '#22c55e', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
            { label: 'M5', data: Array(30).fill(null), borderColor: '#3b82f6', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
            { label: 'M6', data: Array(30).fill(null), borderColor: '#a855f7', borderWidth: 1.5, pointRadius: 0, tension: 0.1 },
        ];

        const labels = Array(30).fill('');

        const chartLinear = new Chart(document.getElementById('chart-linear').getContext('2d'), {
            type: 'line',
            data: { labels: labels, datasets: JSON.parse(JSON.stringify(chartDatasetsTemplate)) },
            options: commonOptions
        });

        const chartVertical = new Chart(document.getElementById('chart-vertical').getContext('2d'), {
            type: 'line',
            data: { labels: labels, datasets: JSON.parse(JSON.stringify(chartDatasetsTemplate)) },
            options: commonOptions
        });

        const chartRotation = new Chart(document.getElementById('chart-rotation').getContext('2d'), {
            type: 'line',
            data: { labels: labels, datasets: JSON.parse(JSON.stringify(chartDatasetsTemplate)) },
            options: commonOptions
        });

        const charts = [chartLinear, chartVertical, chartRotation];

        // 2D Area Scan XY Plot Init
        const scanXyCtx = document.getElementById('scan-xy-plot').getContext('2d');
        const scanXyChart = new Chart(scanXyCtx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Planned Path',
                        data: [],
                        borderColor: 'rgba(71, 85, 105, 0.4)', // slate-600/40
                        backgroundColor: 'rgba(71, 85, 105, 0.2)',
                        pointRadius: 2,
                        showLine: true,
                        borderDash: [3, 3],
                        borderWidth: 1,
                        tension: 0
                    },
                    {
                        label: 'Scanned',
                        data: [],
                        borderColor: '#22c55e', // green-500
                        backgroundColor: '#22c55e',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 9, family: 'JetBrains Mono' } }
                    },
                    y: {
                        display: true,
                        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 9, family: 'JetBrains Mono' } }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `X: ${context.parsed.x.toFixed(4)}, Y: ${context.parsed.y.toFixed(4)}`;
                            }
                        }
                    }
                },
                animation: false
            }
        });

        // Store latest RBV values
        const currentRbvs = [0, 0, 0, 0, 0, 0];

        // Periodically update chart
        let chartIntervalId = null;

        function updateCharts() {
            labels.push('');
            labels.shift();

            charts.forEach((chart, chartIdx) => {
                for (let i = 0; i < 6; i++) {
                    // axesConfig는 loadSession 이나 loadServerStage 등에 의해 채워짐
                    // axisType: "Linear", "Vertical", "Rotation" 중 하나
                    const motorType = (axesConfig[i] && axesConfig[i].axisType) ? axesConfig[i].axisType : 'Linear';

                    // 0: Linear, 1: Vertical, 2: Rotation
                    let targetChartIdx = 0;
                    if (motorType === 'Vertical') targetChartIdx = 1;
                    else if (motorType === 'Rotation' || motorType === 'Swivel') targetChartIdx = 2;

                    // 해당 차트 인덱스와 일치할 때만 값을 넣고, 아니면 null을 넣어 선이 그려지지 않게 함
                    const value = (chartIdx === targetChartIdx) ? currentRbvs[i] : null;

                    chart.data.datasets[i].data.push(value);
                    chart.data.datasets[i].data.shift();
                }
                chart.update('none');
            });
        }

        function updateChartInterval(ms) {
            if (chartIntervalId) clearInterval(chartIntervalId);
            chartIntervalId = setInterval(updateCharts, ms);
            console.log(`[Chart] Update interval changed to ${ms}ms`);
        }

        // Initial start
        updateChartInterval(1000);

        // Hook into onMessage to get RBV
        const origOnMessage = app.onMessage;
        app.onMessage = function (data) {
            origOnMessage.call(this, data);
            if (data.type === 'update' && data.pv.endsWith('.RBV')) {
                const match = data.pv.match(/KOHZU:m(\d+)/);
                if (match) {
                    const idx = parseInt(match[1]) - 1;
                    if (idx >= 0 && idx < 6) {
                        currentRbvs[idx] = data.value;
                    }
                }
            }
        };

        function saveSessionToServer() {
            const now = new Date();
            const yy = String(now.getFullYear()).slice(2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const defaultName = `session_${yy}${mm}${dd}_${hh}${min}.json`;

            const filenameInput = prompt("Enter session name to save:", defaultName);
            if (!filenameInput) return;
            const filename = filenameInput.toLowerCase().endsWith('.json') ? filenameInput : filenameInput + '.json';

            const sessionData = {
                notepad: document.getElementById('notepad').value,
                configs: axesConfig,
                pvs: {}
            };

            // 1. Collect values from valueCache for all motors
            for (let i = 1; i <= 6; i++) {
                const motorPrefix = `${PREFIX}m${i}`;
                CORE_PV_SUFFIXES.forEach(suffix => {
                    const fullPv = motorPrefix + suffix;
                    if (app.valueCache[fullPv] !== undefined) {
                        sessionData.pvs[fullPv] = app.valueCache[fullPv];
                    }
                });
            }

            // 2. Collect current values from DOM
            document.querySelectorAll('input[data-actual-pv], select[data-actual-pv]').forEach(el => {
                const pv = el.getAttribute('data-actual-pv');
                // Allow .VAL to be saved
                if (pv.endsWith('.RLV') || pv.endsWith('.JOGR') || pv.endsWith('.JOGF')) return;
                sessionData.pvs[pv] = el.type === 'number' ? parseFloat(el.value) : el.value;
            });

            // 3. Add sequence steps
            sessionData.sequenceSteps = sequenceSteps;

            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename, data: sessionData })
            })
                .then(r => r.json())
                .then(res => {
                    console.log('Save result:', res.message || res.error);
                    populateSessionDropdown();
                })
                .catch(err => alert('Save failed: ' + err));
        }

        function populateSessionDropdown() {
            fetch('/api/sessions')
                .then(r => r.json())
                .then(files => {
                    const select = document.getElementById('session-select');
                    const seqSelect = document.getElementById('seq-session-select');

                    if (select) {
                        const currentVal = select.value;
                        select.innerHTML = '<option value="">Select Session...</option>';
                        files.forEach(f => {
                            const opt = document.createElement('option');
                            opt.value = f;
                            opt.textContent = f.replace('.json', '');
                            select.appendChild(opt);
                        });
                        if (currentVal) select.value = currentVal;
                    }

                    if (seqSelect) {
                        const currentVal = seqSelect.value;
                        seqSelect.innerHTML = '<option value="">Select Session to Add...</option>';
                        files.forEach(f => {
                            const opt = document.createElement('option');
                            opt.value = f;
                            opt.textContent = f.replace('.json', '');
                            seqSelect.appendChild(opt);
                        });
                        if (currentVal) seqSelect.value = currentVal;
                    }
                })
                .catch(err => console.error('Failed to load sessions:', err));
        }

        function loadSessionFromServer(filename) {
            if (!filename) return;
            fetch(`/sessions/${filename}`)
                .then(r => r.json())
                .then(sessionData => {
                    if (sessionData.notepad !== undefined) {
                        document.getElementById('notepad').value = sessionData.notepad;
                    }
                    if (sessionData.configs) {
                        for (let i = 0; i < 6; i++) {
                            axesConfig[i] = sessionData.configs[i] || null;
                        }
                        renderDashboard();
                        if (currentModalAxis !== null) openModal(currentModalAxis);
                    }
                    saveAppState();
                    if (sessionData.pvs) {
                        for (const [pv, value] of Object.entries(sessionData.pvs)) {
                            const isReadOnly = pv.endsWith('.RBV') || pv.endsWith('.DRBV') || pv.endsWith('.RRBV') || pv.endsWith('.MSTA') || pv.endsWith('.MOVN') || pv.endsWith('.STAT');
                            // Allow .VAL to be loaded (motion trigger)
                            const isMotionTrigger = pv.endsWith('.RLV') || pv.endsWith('.JOGR') || pv.endsWith('.JOGF') || pv.endsWith('.HOMR') || pv.endsWith('.HOMF');
                            if (!isReadOnly && !isMotionTrigger) {
                                app.write(pv, value);
                            }
                        }
                        console.log(`Session [${filename}] loaded successfully.`);
                    }
                    if (sessionData.sequenceSteps) {
                        sequenceSteps = sessionData.sequenceSteps;
                        renderSequenceTable();
                        saveAppState();
                    }
                })
                .catch(err => alert('Load failed: ' + err));
        }

        // --- Sequence Mode Logic ---
        let sequenceSteps = [];
        let isSequenceRunning = false;
        let sequenceStepIndex = 0;
        let sequenceLoopCount = 0;
        let sequenceTimeoutId = null;

        function addSequenceStep() {
            const select = document.getElementById('seq-session-select');
            const filename = select.value;
            if (!filename) return;

            // Fetch session data to get target values for display
            fetch(`/sessions/${filename}`)
                .then(r => r.json())
                .then(data => {
                    const targets = [];
                    for (let i = 1; i <= 6; i++) {
                        const pv = `${PREFIX}m${i}.VAL`;
                        const dvalPv = `${PREFIX}m${i}.DVAL`;
                        const val = data.pvs[pv] !== undefined ? data.pvs[pv] : (data.pvs[dvalPv] !== undefined ? data.pvs[dvalPv] : '-');
                        targets.push(val);
                    }
                    sequenceSteps.push({ filename: filename, use: true, targets: targets });
                    renderSequenceTable();
                    saveAppState();
                })
                .catch(err => {
                    console.error('Failed to pre-load sequence step:', err);
                    sequenceSteps.push({ filename: filename, use: true, targets: Array(6).fill('?') });
                    renderSequenceTable();
                    saveAppState();
                });
        }

        function removeSequenceStep(index) {
            sequenceSteps.splice(index, 1);
            renderSequenceTable();
            saveAppState();
        }

        function toggleStepUse(index) {
            sequenceSteps[index].use = !sequenceSteps[index].use;
            saveAppState();
        }

        function renderSequenceTable(activeIndex = -1) {
            const body = document.getElementById('sequence-steps-body');
            body.innerHTML = '';

            // Get only active steps for highlighting logic
            const activeSteps = sequenceSteps.filter(s => s.use);
            sequenceSteps.forEach((step, idx) => {
                const prevStep = idx > 0 ? sequenceSteps[idx - 1] : null;
                const targetHtml = step.targets.map((t, i) => {
                    // Check if unchanged from previous step
                    const isUnchanged = prevStep && t === prevStep.targets[i];
                    const colorClass = isUnchanged ? 'text-slate-500' : (t === '-' ? 'text-slate-600' : 'text-blue-400');

                    return `
                    <div class="text-center">
                        <span class="text-xs ${colorClass} font-bold tabular-nums">${typeof t === 'number' ? t.toFixed(1) : t}</span>
                    </div>
                `}).join('');

                // Check if this step is currently running
                // Index mapping logic: we need to find if this 'physical' index is the 'sequenceStepIndex'-th active step
                let isCurrentRunning = false;
                if (activeIndex !== -1 && step.use) {
                    let activeCounter = 0;
                    for (let i = 0; i < sequenceSteps.length; i++) {
                        if (sequenceSteps[i].use) {
                            if (activeCounter === activeIndex && i === idx) {
                                isCurrentRunning = true;
                                break;
                            }
                            activeCounter++;
                        }
                    }
                }

                const row = document.createElement('tr');
                row.className = isCurrentRunning ? "bg-green-900/10" : "hover:bg-slate-700/20";
                row.innerHTML = `
                    <td class="px-2 py-2 ${isCurrentRunning ? 'text-green-400 !font-black' : 'text-slate-500'} font-bold">${idx + 1}</td>
                    <td class="px-2 py-2 ${isCurrentRunning ? 'text-green-300' : 'text-slate-300'} font-bold">${step.filename.replace('.json', '')}</td>
                    <td class="px-2 py-1">
                        <div class="grid grid-cols-6 gap-2">
                            ${targetHtml}
                        </div>
                    </td>
                    <td class="px-2 py-2 text-center">
                        <input type="checkbox" ${step.use ? 'checked' : ''} onchange="toggleStepUse(${idx})" 
                               class="w-4 h-4 accent-blue-600 bg-slate-900 border-slate-600 rounded">
                    </td>
                    <td class="px-2 py-2 text-center">
                        <button onclick="removeSequenceStep(${idx})" class="text-red-400 hover:text-red-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </td>
                `;
                body.appendChild(row);
            });
        }

        function updateSeqIterationUI() {
            const mode = document.getElementById('seq-repeat-mode').value;
            const container = document.getElementById('seq-count-container');
            if (mode === 'multiple') {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        }



        async function startSequence() {
            const activeSteps = sequenceSteps.filter(s => s.use);
            if (activeSteps.length === 0) {
                alert("Please add and enable at least one session file to the sequence.");
                return;
            }

            isSequenceRunning = true;
            sequenceStepIndex = 0;
            sequenceLoopCount = 1;

            const mode = document.getElementById('seq-repeat-mode').value;
            const targetCount = mode === 'multiple' ? parseInt(document.getElementById('seq-repeat-count').value) : (mode === 'infinite' ? Infinity : 1);

            // UI Update
            document.getElementById('btn-seq-start').classList.add('hidden');
            document.getElementById('btn-seq-stop').classList.remove('hidden');
            document.getElementById('seq-status-badge').innerText = "RUNNING";
            document.getElementById('seq-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/50 text-green-400 border border-green-800 animate-pulse";
            document.getElementById('seq-progress').classList.remove('hidden');
            document.getElementById('seq-total-loop').innerText = (targetCount === Infinity) ? "∞" : targetCount;

            renderSequenceTable(0); // Highlight first step
            runNextSequenceStep(targetCount);
        }

        function stopSequence() {
            isSequenceRunning = false;
            if (sequenceTimeoutId) clearTimeout(sequenceTimeoutId);

            document.getElementById('btn-seq-start').classList.remove('hidden');
            document.getElementById('btn-seq-stop').classList.add('hidden');
            document.getElementById('seq-status-badge').innerText = "STOPPED";
            document.getElementById('seq-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/50 text-red-400 border border-red-800";
            document.getElementById('seq-progress').classList.add('hidden');
            renderSequenceTable(); // Reset highlight
        }

        function areMotorsMoving() {
            for (let i = 0; i < 6; i++) {
                const movn = app.valueCache[`${PREFIX}m${i + 1}.MOVN`];
                const dmov = app.valueCache[`${PREFIX}m${i + 1}.DMOV`];
                // If MOVN is 1 OR DMOV is 0, motor is likely active
                if (movn === 1 || dmov === 0) return true;
            }
            return false;
        }

        async function runNextSequenceStep(targetLoopCount) {
            if (!isSequenceRunning) return;

            const activeSteps = sequenceSteps.filter(s => s.use);

            // Current step logic
            if (sequenceStepIndex >= activeSteps.length) {
                // Loop finished
                if (sequenceLoopCount >= targetLoopCount) {
                    stopSequence();
                    document.getElementById('seq-status-badge').innerText = "FINISHED";
                    document.getElementById('seq-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/50 text-blue-400 border border-blue-800";
                    return;
                }
                sequenceLoopCount++;
                sequenceStepIndex = 0;
            }

            // UI Update Progress
            document.getElementById('seq-cur-loop').innerText = sequenceLoopCount;
            document.getElementById('seq-cur-step').innerText = sequenceStepIndex + 1;
            renderSequenceTable(sequenceStepIndex);

            const step = activeSteps[sequenceStepIndex];
            console.log(`[Sequence] Loop ${sequenceLoopCount}, Step ${sequenceStepIndex + 1}: Loading ${step.filename}`);

            // 1. Load the session
            await loadSessionAction(step.filename);

            // 2. Wait for motors to finish moving
            const dwellSec = parseFloat(document.getElementById('seq-dwell-time').value) || 0;
            waitForMotorsIdle(() => {
                sequenceStepIndex++;
                sequenceTimeoutId = setTimeout(() => runNextSequenceStep(targetLoopCount), dwellSec * 1000);
            });
        }

        function waitForMotorsIdle(callback) {
            if (!isSequenceRunning) return;

            // Wait a small bit for MOVN to trigger if the write just happened
            setTimeout(() => {
                const check = setInterval(() => {
                    if (!isSequenceRunning) {
                        clearInterval(check);
                        return;
                    }
                    if (!areMotorsMoving()) {
                        clearInterval(check);
                        callback();
                    }
                }, 500);
            }, 300); // Initial 300ms delay to allow motors to react
        }

        // --- Area Scan Logic ---
        let isScanRunning = false;
        let scanPoints = [];
        let scanCurrentIndex = 0;
        let scanTimeoutId = null;
        let currentScanMode = 'raster';

        function switchScanTab(mode) {
            currentScanMode = mode;
            document.getElementById('scan-tab-raster').classList.toggle('hidden', mode !== 'raster');
            document.getElementById('scan-tab-fermat').classList.toggle('hidden', mode !== 'fermat');

            document.getElementById('tab-btn-raster').className = mode === 'raster' ?
                "flex-1 py-1 text-xs font-bold border-b-2 border-blue-500 text-blue-400 transition-colors" :
                "flex-1 py-1 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors";

            document.getElementById('tab-btn-fermat').className = mode === 'fermat' ?
                "flex-1 py-1 text-xs font-bold border-b-2 border-blue-500 text-blue-400 transition-colors" :
                "flex-1 py-1 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors";
        }

        function startAreaScan() {
            const xAxis = document.getElementById('scan-x-axis').value;
            const yAxis = document.getElementById('scan-y-axis').value;

            if (xAxis === yAxis) {
                alert("X and Y axes must be different.");
                return;
            }

            scanPoints = [];

            if (currentScanMode === 'raster') {
                const xStart = parseFloat(document.getElementById('raster-x-start').value);
                const xEnd = parseFloat(document.getElementById('raster-x-end').value);
                const xSteps = parseInt(document.getElementById('raster-x-steps').value);

                const yStart = parseFloat(document.getElementById('raster-y-start').value);
                const yEnd = parseFloat(document.getElementById('raster-y-end').value);
                const ySteps = parseInt(document.getElementById('raster-y-steps').value);

                if (xSteps < 2 || ySteps < 2) {
                    alert("Points for X and Y must be at least 2.");
                    return;
                }

                const xStepSize = (xEnd - xStart) / (xSteps - 1);
                const yStepSize = (yEnd - yStart) / (ySteps - 1);

                for (let j = 0; j < ySteps; j++) {
                    const yPos = yStart + (j * yStepSize);

                    if (j % 2 === 0) {
                        for (let i = 0; i < xSteps; i++) {
                            scanPoints.push({ x: xStart + (i * xStepSize), y: yPos });
                        }
                    } else {
                        for (let i = xSteps - 1; i >= 0; i--) {
                            scanPoints.push({ x: xStart + (i * xStepSize), y: yPos });
                        }
                    }
                }
            } else if (currentScanMode === 'fermat') {
                const cx = parseFloat(document.getElementById('fermat-x-center').value);
                const cy = parseFloat(document.getElementById('fermat-y-center').value);
                const xr = parseFloat(document.getElementById('fermat-x-range').value);
                const yr = parseFloat(document.getElementById('fermat-y-range').value);
                const dr = parseFloat(document.getElementById('fermat-dr').value);
                const factor = parseFloat(document.getElementById('fermat-factor').value);

                const goldenAngle = 137.508 * Math.PI / 180.0;

                // Point density approximation: dr is roughly the point spacing
                const area = xr * yr;
                const estN = Math.ceil(area / (dr * dr));
                const maxSearch = Math.max(1000, estN * 5); // Safety limit

                for (let n = 0; n < maxSearch; n++) {
                    // Bluesky logic: r = dr * sqrt(n/factor)
                    const r = dr * Math.sqrt(n / factor);
                    const theta = n * goldenAngle;

                    const dx = r * Math.cos(theta);
                    const dy = r * Math.sin(theta);

                    // If radius is much larger than diagnostic dimension, we are done
                    if (r > Math.max(xr, yr) * 1.5) break;

                    // Keep points only within requested range
                    if (Math.abs(dx) <= xr / 2 && Math.abs(dy) <= yr / 2) {
                        scanPoints.push({
                            x: parseFloat((cx + dx).toFixed(4)),
                            y: parseFloat((cy + dy).toFixed(4))
                        });
                    }
                }
            }

            isScanRunning = true;
            scanCurrentIndex = 0;

            // UI Update
            document.getElementById('btn-scan-start').classList.add('hidden');
            document.getElementById('btn-scan-stop').classList.remove('hidden');
            document.getElementById('scan-status-badge').innerText = "RUNNING";
            document.getElementById('scan-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/50 text-blue-400 border border-blue-800 animate-pulse";
            document.getElementById('scan-progress').classList.remove('hidden');
            document.getElementById('scan-progress-bar-container').classList.remove('hidden');
            document.getElementById('scan-percentage').innerText = "0";
            document.getElementById('scan-progress-fill').style.width = "0%";
            document.getElementById('scan-total-pt').innerText = scanPoints.length;

            // Update Preview Chart
            scanXyChart.data.datasets[0].data = scanPoints.map(p => ({ x: p.x, y: p.y }));
            scanXyChart.data.datasets[1].data = [];
            scanXyChart.update();

            runNextScanPt();
        }

        function stopAreaScan() {
            isScanRunning = false;
            if (scanTimeoutId) clearTimeout(scanTimeoutId);

            document.getElementById('btn-scan-start').classList.remove('hidden');
            document.getElementById('btn-scan-stop').classList.add('hidden');
            document.getElementById('scan-status-badge').innerText = "STOPPED";
            document.getElementById('scan-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/50 text-red-400 border border-red-800";
            document.getElementById('scan-progress').classList.add('hidden');
            document.getElementById('scan-progress-bar-container').classList.add('hidden');
        }

        function runNextScanPt() {
            if (!isScanRunning) return;

            if (scanCurrentIndex >= scanPoints.length) {
                stopAreaScan();
                document.getElementById('scan-status-badge').innerText = "FINISHED";
                document.getElementById('scan-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/50 text-green-400 border border-green-800";
                return;
            }

            const pt = scanPoints[scanCurrentIndex];
            const xAxis = document.getElementById('scan-x-axis').value;
            const yAxis = document.getElementById('scan-y-axis').value;

            // UI Progress
            document.getElementById('scan-cur-pt').innerText = scanCurrentIndex + 1;
            const pct = Math.round(((scanCurrentIndex + 1) / scanPoints.length) * 100);
            document.getElementById('scan-percentage').innerText = pct;
            document.getElementById('scan-progress-fill').style.width = pct + "%";

            // Update Chart: Move point from planned to scanned (visually)
            scanXyChart.data.datasets[1].data.push({ x: pt.x, y: pt.y });
            scanXyChart.update('none');

            // Command Move
            app.write(`${PREFIX}m${xAxis}.VAL`, pt.x);
            app.write(`${PREFIX}m${yAxis}.VAL`, pt.y);

            // Wait for motion
            const dwellSec = parseFloat(document.getElementById('scan-dwell').value) || 0;

            // Wait slightly before checking to ensure MOVN flag triggers
            setTimeout(() => {
                const check = setInterval(() => {
                    if (!isScanRunning) {
                        clearInterval(check);
                        return;
                    }
                    if (!areMotorsMoving()) {
                        clearInterval(check);
                        scanCurrentIndex++;
                        scanTimeoutId = setTimeout(() => runNextScanPt(), dwellSec * 1000);
                    }
                }, 100);
            }, 50);
        }

        // Helper to perform session load without affecting current axis view unless intentional
        function loadSessionAction(filename) {
            return fetch(`/sessions/${filename}`)
                .then(r => r.json())
                .then(sessionData => {
                    if (sessionData.configs) {
                        for (let i = 0; i < 6; i++) {
                            axesConfig[i] = sessionData.configs[i] || null;
                        }
                        renderDashboard();
                        // Optional: if currentModalAxis is open, update it
                        if (currentModalAxis !== null) openModal(currentModalAxis);
                    }
                    if (sessionData.pvs) {
                        for (const [pv, value] of Object.entries(sessionData.pvs)) {
                            const isReadOnly = pv.endsWith('.RBV') || pv.endsWith('.DRBV') || pv.endsWith('.RRBV') || pv.endsWith('.MSTA') || pv.endsWith('.MOVN') || pv.endsWith('.STAT');
                            // Sequence execution SHOULD trigger motion. VAL and DVAL allowed here.
                            const isInternalControl = pv.endsWith('.JOGR') || pv.endsWith('.JOGF') || pv.endsWith('.HOMR') || pv.endsWith('.HOMF') || pv.endsWith('.STOP');
                            if (!isReadOnly && !isInternalControl) {
                                app.write(pv, value);
                            }
                        }
                    }
                    return true;
                });
        }

        // Initialize lists
        populateSessionDropdown();


