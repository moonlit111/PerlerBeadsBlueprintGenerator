// 现代化拼豆图纸生成器 - 主应用程序

class PerlerBeadApp {
    constructor() {
        this.uploadedImage = null;
        this.gridData = null;
        this.colorGrid = [];
        this.selectedTool = 'brush';
        this.selectedColor = null;
        this.colorSystem = 'MARD';
        this.colorMethod = 'dominant';
        this.zoomLevel = 1;
        this.isDrawing = false;
        this.showGridLines = true;
        this.isGenerated = false;
        this.history = [];
        this.historyIndex = -1;
        // 图片历史记录栈
        this.imageHistory = [];
        this.imageHistoryIndex = -1;
        
        this.lockGridRatio = false;
        this.gridRatio = 1;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.gridLinesBeforeSelect = true;
        this.isSelectingGrid = false;
        this.selectionStart = null;
        this.baseColorGrid = null;
        this.nineGridState = { x: 0, y: 0, width: 0, height: 0 };
        this.nineGridDrag = null;
        this.mergeThreshold = 25;
        this.isCropping = false;
        this.isAdjustingContrast = false;
        this.contrastValue = 0;
        this.gridSelectionSize = 3;
        
        // Workspace state
        this.currentWorkspace = 'generation'; // 'generation' or 'editing'
        this.isCompareMode = false;

        this.initElements();
        this.initNineGridOverlay();
        this.initEventListeners();
        this.loadTheme();
        this.loadSelectedColors();
        this.initAllColorsPalette();
        this.initCollapsibles();
        this.initScrollAnimations();
        
        // Initialize workspace UI
        this.switchWorkspace('generation');
    }

    initScrollAnimations() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Staggering logic for specific groups
                    if (entry.target.classList.contains('tool-btn')) {
                        // Keep delay as set
                    }
                    entry.target.classList.add('anim-active');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe static elements with .scroll-anim
        document.querySelectorAll('.scroll-anim').forEach((el) => {
            // Apply stagger for siblings sharing .scroll-anim
            if (el.parentElement) {
                const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('scroll-anim'));
                const idx = siblings.indexOf(el);
                if (idx > 0) {
                    el.style.animationDelay = `${idx * 0.15}s`;
                }
            }
            observer.observe(el);
        });

        // Dynamic elements: Tool buttons
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach((btn, index) => {
            btn.classList.add('scroll-anim', 'anim-up');
            btn.style.animationDelay = `${index * 0.05}s`;
            observer.observe(btn);
        });

        // Dynamic elements: Action buttons
        const actionBtns = document.querySelectorAll('.btn-sidebar-action');
        actionBtns.forEach((btn, index) => {
            btn.classList.add('scroll-anim', 'anim-up');
            btn.style.animationDelay = `${index * 0.05}s`;
            observer.observe(btn);
        });
    }

    initCollapsibles() {
        document.querySelectorAll('.section-header.collapsible').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section.classList.toggle('collapsed');
            });
        });
    }

    initElements() {
        // UI元素
        this.uploadPrompt = document.getElementById('uploadPrompt');
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.canvasInfo = document.getElementById('canvasInfo');
        this.editGuard = document.getElementById('editGuard');
        this.guardAnalyzeBtn = document.getElementById('guardAnalyzeBtn');
        this.imageInput = document.getElementById('imageInput');
        this.mainCanvas = document.getElementById('mainCanvas');
        this.ctx = this.mainCanvas.getContext('2d');
        this.canvasScroll = document.getElementById('canvasScroll');
        this.toolsSection = document.getElementById('toolsSection');
        
        // Workspace Elements
        this.workspaceTabs = document.querySelectorAll('.ws-tab');
        this.genSidebarContent = document.getElementById('gen-sidebar-content');
        this.editSidebarContent = document.getElementById('edit-sidebar-content');
        this.genToolbar = document.getElementById('genToolbar');
        this.editToolbar = document.getElementById('editToolbar');
        this.toggleCompareBtn = document.getElementById('toggleCompareBtn');
        this.toggleCompareBtnSidebar = document.getElementById('toggleCompareBtnSidebar');
        this.sendToEditBtn = document.getElementById('sendToEditBtn');
        this.sendToEditBtnSidebar = document.getElementById('sendToEditBtnSidebar');

        this.lockGridRatioBtn = document.getElementById('lockGridRatioBtn');
        this.selectGridBtn = document.getElementById('selectGridBtn');
        this.selectionBox = document.getElementById('selectionBox');
        this.gridOverlay = document.getElementById('gridOverlay');
        this.nineGridHandles = this.selectionBox ? this.selectionBox.querySelectorAll('[data-handle]') : [];
        
        // 调色板
        this.paletteUsed = document.getElementById('paletteUsed');
        this.paletteAll = document.getElementById('paletteAll');
        this.paletteStats = document.getElementById('paletteStats');
        this.colorStats = document.getElementById('colorStats');
        this.allColorsGrid = document.getElementById('allColorsGrid');
        
        // 模态框
        this.colorSelectModal = document.getElementById('colorSelectModal');
        this.colorSelectList = document.getElementById('colorSelectList');
        this.colorCountSummary = document.getElementById('colorCountSummary');
        this.exportModal = document.getElementById('exportModal');
        this.exportModalOverlay = document.getElementById('exportModalOverlay');
        this.exportShowGrid = document.getElementById('exportShowGrid');
        this.exportGridColor = document.getElementById('exportGridColor');
        this.exportGridInterval = document.getElementById('exportGridInterval');
        this.exportGridIntervalValue = document.getElementById('exportGridIntervalValue');
        this.exportShowCoords = document.getElementById('exportShowCoords');
        this.exportHideCodes = document.getElementById('exportHideCodes');
        this.exportIncludeStats = document.getElementById('exportIncludeStats');
        this.exportColorPalette = document.getElementById('exportColorPalette');
        this.exportCoordInterval = document.getElementById('exportCoordInterval');
        this.exportCoordIntervalValue = document.getElementById('exportCoordIntervalValue');

        // 图片处理
        this.rotateLeftBtn = document.getElementById('rotateLeftBtn');
        this.rotateRightBtn = document.getElementById('rotateRightBtn');
        this.cropBtn = document.getElementById('cropBtn');
        this.confirmCropBtn = document.getElementById('confirmCropBtn');
        this.cancelCropBtn = document.getElementById('cancelCropBtn');
        this.cropActions = document.getElementById('cropActions');
        
        // 对比度
        this.contrastBtn = document.getElementById('contrastBtn');
        this.contrastActions = document.getElementById('contrastActions');
        this.contrastSlider = document.getElementById('contrastSlider');
        this.contrastValueDisplay = document.getElementById('contrastValueDisplay');
        this.confirmContrastBtn = document.getElementById('confirmContrastBtn');
        this.cancelContrastBtn = document.getElementById('cancelContrastBtn');

        // 缩放
        this.resizeBtn = document.getElementById('resizeBtn');
        this.resizeActions = document.getElementById('resizeActions');
        this.resizeWidth = document.getElementById('resizeWidth');
        this.resizeHeight = document.getElementById('resizeHeight');
        this.resizeLockRatio = document.getElementById('resizeLockRatio');
        this.resizeAlgorithm = document.getElementById('resizeAlgorithm');
        this.confirmResizeBtn = document.getElementById('confirmResizeBtn');
        this.cancelResizeBtn = document.getElementById('cancelResizeBtn');

        this.imageProcessSection = document.getElementById('imageProcessSection');
        
        // 消息提示
        this.toastContainer = document.querySelector('.toast-container');
    }

    initEventListeners() {
        // 辅助函数：安全绑定事件
        const bindClick = (id, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', handler);
        };

        const bindChange = (id, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', handler);
        };

        // Workspace Tabs
        this.workspaceTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const ws = tab.dataset.ws;
                if (ws === 'editing' && !this.isGenerated) {
                    this.showToast('请先生成图纸', 'info');
                    return;
                }
                this.switchWorkspace(ws);
            });
        });

        // Gen Actions
        bindClick('toggleCompareBtn', () => this.toggleCompare());
        bindClick('toggleCompareBtnSidebar', () => this.toggleCompare());
        bindClick('sendToEditBtn', () => this.sendToEdit());
        bindClick('sendToEditBtnSidebar', () => this.sendToEdit());
        bindClick('selectColorsBtnTop', () => this.showColorSelectModal());

        // 上传按钮
        bindClick('uploadBtn', () => this.imageInput.click());
        bindClick('uploadBtnLarge', () => this.imageInput.click());
        
        // 文件上传
        if (this.imageInput) {
            this.imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.handleImageUpload(file);
                e.target.value = '';
            });
        }
        
        // 工具栏按钮
        bindClick('undoBtn', () => this.undo());
        bindClick('redoBtn', () => this.redo());
        bindClick('exportBtn', () => this.showExportModal());
        bindClick('clearBtn', () => this.clearCanvas());
        bindClick('themeToggle', () => this.toggleTheme());
        
        // 图片处理按钮
        bindClick('rotateLeftBtn', () => this.rotateImage(-90));
        bindClick('rotateRightBtn', () => this.rotateImage(90));
        bindClick('cropBtn', () => this.toggleCropMode());
        bindClick('confirmCropBtn', () => this.confirmCrop());
        bindClick('cancelCropBtn', () => this.cancelCrop());

        // 对比度
        bindClick('contrastBtn', () => this.toggleContrastMode());
        bindClick('confirmContrastBtn', () => this.confirmContrast());
        bindClick('cancelContrastBtn', () => this.cancelContrast());
        
        if (this.contrastSlider) {
            this.contrastSlider.addEventListener('input', (e) => {
                this.contrastValue = parseInt(e.target.value, 10);
                if (this.contrastValueDisplay) this.contrastValueDisplay.textContent = this.contrastValue;
                this.updateContrastPreview();
            });
        }

        // 缩放
        bindClick('resizeBtn', () => this.toggleResizeMode());
        bindClick('confirmResizeBtn', () => this.confirmResize());
        bindClick('cancelResizeBtn', () => this.cancelResize());
        bindClick('undoImageBtn', () => this.undoImageProcess());
        
        // 缩放比例滑块
        const resizeScale = document.getElementById('resizeScale');
        const resizeScaleValue = document.getElementById('resizeScaleValue');
        
        if (resizeScale && this.resizeWidth && this.resizeHeight) {
            resizeScale.addEventListener('input', () => {
                const scale = parseFloat(resizeScale.value);
                if (resizeScaleValue) resizeScaleValue.textContent = scale.toFixed(1) + 'x';
                
                if (this.uploadedImage) {
                    const w = Math.round(this.uploadedImage.width * scale);
                    const h = Math.round(this.uploadedImage.height * scale);
                    this.resizeWidth.value = w;
                    this.resizeHeight.value = h;
                }
            });
        }
        
        // 锁定宽高比按钮
        const resizeLockBtn = document.getElementById('resizeLockRatio');
        if (resizeLockBtn) {
            resizeLockBtn.addEventListener('click', () => {
                const isLocked = resizeLockBtn.classList.toggle('active');
                // 这里我们不再使用 checkbox，而是通过 active 类来判断
                // 但为了保持兼容性，我们可能需要在 resizeWidth/Height 的监听器中修改判断逻辑
            });
        }

        if (this.resizeWidth && this.resizeHeight) {
            this.resizeWidth.addEventListener('input', () => {
                const isLocked = document.getElementById('resizeLockRatio').classList.contains('active');
                if (isLocked && this.uploadedImage) {
                    const w = parseInt(this.resizeWidth.value);
                    if (w > 0) {
                        const ratio = this.uploadedImage.width / this.uploadedImage.height;
                        this.resizeHeight.value = Math.round(w / ratio);
                        
                        // 反向更新比例滑块（近似值）
                        if (resizeScale) {
                            const scale = w / this.uploadedImage.width;
                            // 只有当 scale 在滑块范围内时才更新滑块显示，避免跳动
                            if (scale >= 0.1 && scale <= 5) {
                                // resizeScale.value = scale; // 可选：不自动更新滑块位置以免干扰输入
                                if (resizeScaleValue) resizeScaleValue.textContent = scale.toFixed(1) + 'x';
                            } else {
                                if (resizeScaleValue) resizeScaleValue.textContent = '自定义';
                            }
                        }
                    }
                }
            });
            this.resizeHeight.addEventListener('input', () => {
                const isLocked = document.getElementById('resizeLockRatio').classList.contains('active');
                if (isLocked && this.uploadedImage) {
                    const h = parseInt(this.resizeHeight.value);
                    if (h > 0) {
                        const ratio = this.uploadedImage.width / this.uploadedImage.height;
                        this.resizeWidth.value = Math.round(h * ratio);
                        
                        // 反向更新比例滑块
                         if (resizeScale) {
                            const scale = h / this.uploadedImage.height;
                            if (scale >= 0.1 && scale <= 5) {
                                if (resizeScaleValue) resizeScaleValue.textContent = scale.toFixed(1) + 'x';
                            } else {
                                if (resizeScaleValue) resizeScaleValue.textContent = '自定义';
                            }
                        }
                    }
                }
            });
        }

        // 工具选择
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // 只有带有 data-tool 属性的才是真正的工具按钮
                if (!btn.dataset.tool) return;
                
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTool = btn.dataset.tool;
                this.updateCursor();
            });
        });
        
        // 手动网格划分滑块 + 数值输入
        const bindRangeAndNumber = (rangeId, numberId, onChange) => {
            const rangeEl = document.getElementById(rangeId);
            const numberEl = document.getElementById(numberId);
            if (!rangeEl || !numberEl) return null;

            const syncFromRange = () => {
                numberEl.value = rangeEl.value;
                onChange();
            };
            const syncFromNumber = () => {
                rangeEl.value = numberEl.value;
                onChange();
            };
            rangeEl.addEventListener('input', syncFromRange);
            numberEl.addEventListener('input', syncFromNumber);
            return { rangeEl, numberEl };
        };

        const offsetHighPrecision = document.getElementById('offsetHighPrecision');
        
        // 先定义锁定函数，以便在 bindRangeAndNumber 回调中使用
        const applyLockFromWidth = () => {
            if (!this.lockGridRatio) return;
            const widthInput = document.getElementById('gridCols');
            if (!widthInput) return;
            const widthVal = parseFloat(widthInput.value);
            if (!isFinite(widthVal) || widthVal <= 0 || this.gridRatio === 0) return;
            const newHeight = widthVal / this.gridRatio;
            const rowsInput = document.getElementById('gridRows');
            const rowsNumInput = document.getElementById('gridRowsInput');
            if (rowsInput) rowsInput.value = newHeight.toFixed(2);
            if (rowsNumInput) rowsNumInput.value = newHeight.toFixed(2);
        };

        const applyLockFromHeight = () => {
            if (!this.lockGridRatio) return;
            const heightInput = document.getElementById('gridRows');
            if (!heightInput) return;
            const heightVal = parseFloat(heightInput.value);
            if (!isFinite(heightVal) || heightVal <= 0) return;
            const newWidth = heightVal * this.gridRatio;
            const colsInput = document.getElementById('gridCols');
            const colsNumInput = document.getElementById('gridColsInput');
            if (colsInput) colsInput.value = newWidth.toFixed(2);
            if (colsNumInput) colsNumInput.value = newWidth.toFixed(2);
        };

        // 绑定控件并传入包含锁定逻辑的回调
        const gridColsControls = bindRangeAndNumber('gridCols', 'gridColsInput', () => {
            applyLockFromWidth();
            this.updateGridManual();
        });
        const gridRowsControls = bindRangeAndNumber('gridRows', 'gridRowsInput', () => {
            applyLockFromHeight();
            this.updateGridManual();
        });
        const gridOffsetXControls = bindRangeAndNumber('gridOffsetX', 'gridOffsetXInput', () => this.updateGridManual());
        const gridOffsetYControls = bindRangeAndNumber('gridOffsetY', 'gridOffsetYInput', () => this.updateGridManual());

        // 框选网格大小
        const gridSelectionSizeInput = document.getElementById('gridSelectionSize');
        if (gridSelectionSizeInput) {
            gridSelectionSizeInput.addEventListener('input', (e) => {
                this.gridSelectionSize = parseInt(e.target.value) || 3;
                const display = document.getElementById('gridSelectionSizeValue');
                if (display) display.textContent = this.gridSelectionSize;
                
                if (this.isSelectingGrid) {
                    this.renderNineGridOverlay();
                }
            });
        }
        
        // 顶部上传按钮
        bindClick('uploadBtnTop', () => {
            const input = document.getElementById('imageInput');
            if (input) input.click();
        });

        const setOffsetBounds = (controls, min, max) => {
            if (!controls) return;
            const clamp = (v) => Math.min(max, Math.max(min, parseFloat(v) || 0));
            controls.rangeEl.min = min;
            controls.rangeEl.max = max;
            controls.numberEl.min = min;
            controls.numberEl.max = max;
            const clamped = clamp(controls.rangeEl.value);
            controls.rangeEl.value = clamped;
            controls.numberEl.value = clamped;
        };
        const applyOffsetStep = () => {
            if (!gridOffsetXControls || !gridOffsetYControls) return;
            const high = offsetHighPrecision && offsetHighPrecision.checked;
            const min = high ? -10 : -50;
            const max = high ? 10 : 50;
            const rangeStep = high ? 0.005 : 0.05;
            const numberStep = 0.01;
            setOffsetBounds(gridOffsetXControls, min, max);
            setOffsetBounds(gridOffsetYControls, min, max);
            gridOffsetXControls.rangeEl.step = rangeStep;
            gridOffsetYControls.rangeEl.step = rangeStep;
            gridOffsetXControls.numberEl.step = numberStep;
            gridOffsetYControls.numberEl.step = numberStep;
        };
        applyOffsetStep();
        if (offsetHighPrecision) {
            offsetHighPrecision.addEventListener('change', applyOffsetStep);
        }

        // 框选网格
        bindClick('selectGridBtn', () => {
            if (this.isSelectingGrid) {
                this.endGridSelection();
            } else {
                this.startGridSelection();
            }
        });

        // 锁定宽高比
        if (this.lockGridRatioBtn) {
            this.lockGridRatioBtn.addEventListener('click', () => {
                this.lockGridRatio = !this.lockGridRatio;
                if (this.lockGridRatio) {
                    const wInput = document.getElementById('gridCols');
                    const hInput = document.getElementById('gridRows');
                    const w = wInput ? (parseFloat(wInput.value) || 1) : 1;
                    const h = hInput ? (parseFloat(hInput.value) || 1) : 1;
                    this.gridRatio = w / h;
                    this.lockGridRatioBtn.classList.add('active');
                } else {
                    this.lockGridRatioBtn.classList.remove('active');
                }
            });
        }
        
        // 快捷键处理
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSelectingGrid) {
                this.endGridSelection();
                return;
            }
            // 允许在输入框中输入
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (!this.uploadedImage) return;
            
            // 偏移快捷键 (需要按住 Ctrl/Cmd 或者是方向键直接生效？原逻辑是 !e.ctrlKey return，意味着必须按 Ctrl)
            // 但方向键通常用于微调，可能不需要 Ctrl? 
            // 原代码：if (!e.ctrlKey || !this.uploadedImage) return;
            // 我们修改为：方向键需要 Ctrl (为了避免滚动冲突)，W/A/S/D 不需要 (或者也需要?)
            // 用户习惯：通常 WASD 移动视角/对象，方向键也是。
            // 这里原逻辑是偏移需要 Ctrl。我们保持偏移需要 Ctrl，或者根据用户需求调整。
            // 用户只说备注快捷键，没说改逻辑。
            // 但 W/S 调整宽度通常不需要 Ctrl。
            
            const isCtrl = e.ctrlKey || e.metaKey;

            const offsetDelta = () => {
                const high = offsetHighPrecision && offsetHighPrecision.checked;
                return high ? 0.05 : 0.5;
            };

            const adjust = (controls, delta) => {
                if (!controls) return;
                const next = Math.min(parseFloat(controls.rangeEl.max), Math.max(parseFloat(controls.rangeEl.min), parseFloat(controls.rangeEl.value) + delta));
                controls.rangeEl.value = next;
                controls.numberEl.value = next;
                controls.rangeEl.dispatchEvent(new Event('input')); // 触发联动
            };

            // 偏移 (保持原逻辑，需要 Ctrl)
            if (isCtrl && gridOffsetXControls && gridOffsetYControls) {
                switch(e.key) {
                    case 'ArrowUp': e.preventDefault(); adjust(gridOffsetYControls, -offsetDelta()); return;
                    case 'ArrowDown': e.preventDefault(); adjust(gridOffsetYControls, offsetDelta()); return;
                    case 'ArrowLeft': e.preventDefault(); adjust(gridOffsetXControls, -offsetDelta()); return;
                    case 'ArrowRight': e.preventDefault(); adjust(gridOffsetXControls, offsetDelta()); return;
                }
            }

            // 网格宽高 (W/S/A/D) - 不需要 Ctrl
            if (gridColsControls && gridRowsControls) {
                const sizeDelta = 0.2; // 每次调整 0.2px
                switch(e.key.toLowerCase()) {
                    // A/D 控制宽度 (横向)
                    case 'a': adjust(gridColsControls, -sizeDelta); break;
                    case 'd': adjust(gridColsControls, sizeDelta); break;
                    // W/S 控制高度 (纵向)
                    case 'w': adjust(gridRowsControls, sizeDelta); break;
                    case 's': adjust(gridRowsControls, -sizeDelta); break;
                }
            }
        });
        
        // 颜色分析按钮
        const runAnalyze = () => this.analyzeColors();
        bindClick('analyzeColorsBtn', runAnalyze);
        bindClick('analyzeTopBtn', runAnalyze);
        if (this.guardAnalyzeBtn) {
            this.guardAnalyzeBtn.addEventListener('click', runAnalyze);
        }
        
        // 缩放控制
        bindClick('zoomIn', () => {
            const oldZoom = this.zoomLevel;
            this.zoomLevel = Math.min(this.getMaxZoom(), this.zoomLevel + 0.2);
            const zoomRatio = this.zoomLevel / oldZoom;
            this.panOffsetX *= zoomRatio;
            this.panOffsetY *= zoomRatio;
            this.applyPanBounds();
            this.updateZoom();
        });
        
        bindClick('zoomOut', () => {
            const oldZoom = this.zoomLevel;
            this.zoomLevel = Math.max(0.1, this.zoomLevel - 0.2);
            const zoomRatio = this.zoomLevel / oldZoom;
            this.panOffsetX *= zoomRatio;
            this.panOffsetY *= zoomRatio;
            this.applyPanBounds();
            this.updateZoom();
        });
        
        // 网格线切换
        bindChange('showGridLines', (e) => {
            this.showGridLines = e.target.checked;
            this.redrawCanvas();
        });
        
        // 画布交互
        if (this.mainCanvas) {
            this.mainCanvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
            this.mainCanvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
            this.mainCanvas.addEventListener('mouseup', () => this.onCanvasMouseUp());
            this.mainCanvas.addEventListener('mouseleave', () => this.onCanvasMouseUp());
        }
        
        // 滚轮与触摸
        if (this.canvasScroll) {
            this.canvasScroll.addEventListener('wheel', (e) => this.onCanvasWheel(e), { passive: false });
            this.canvasScroll.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
            this.canvasScroll.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
            this.canvasScroll.addEventListener('touchend', () => this.onTouchEnd());
            
            this.canvasScroll.addEventListener('mousedown', (e) => {
                if (this.startPan(e)) e.stopPropagation();
            });
            this.canvasScroll.addEventListener('mousemove', (e) => this.movePan(e));
            this.canvasScroll.addEventListener('mouseup', () => this.endPan());
            this.canvasScroll.addEventListener('mouseleave', () => this.endPan());
        }

        this.updateCursor();
        
        // 调色板标签
        document.querySelectorAll('.palette-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.palette-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabType = tab.dataset.tab;
                if (this.paletteUsed) this.paletteUsed.style.display = tabType === 'used' ? 'block' : 'none';
                if (this.paletteAll) this.paletteAll.style.display = tabType === 'all' ? 'block' : 'none';
                if (this.paletteStats) this.paletteStats.style.display = tabType === 'stats' ? 'block' : 'none';
            });
        });
        
        // 颜色系统选择
        const colorSystemSelect = document.getElementById('colorSystem');
        if (colorSystemSelect) {
            colorSystemSelect.value = this.colorSystem;
            colorSystemSelect.addEventListener('change', (e) => {
                this.colorSystem = e.target.value;
                this.initAllColorsPalette();
                this.updateUsedColorsPalette();
                this.renderColorSelectList();
                this.updateCurrentColorDisplay();
            });
        }
        
        // 颜色方法选择
        bindChange('colorMethod', (e) => {
            this.colorMethod = e.target.value;
        });
        
        // 颜色选择模态框
        bindClick('closeColorSelectBtn', () => this.hideColorSelectModal());
        bindClick('colorSelectModalOverlay', () => this.hideColorSelectModal());
        bindClick('selectAllBtn', () => this.selectAllColors(true));
        bindClick('deselectAllBtn', () => this.selectAllColors(false));
        bindClick('confirmSelectBtn', () => this.saveColorSelection());
        bindClick('cancelSelectBtn', () => this.hideColorSelectModal());
        bindClick('managePaletteBtn', () => this.showColorSelectModal());

        // 导出模态交互
        bindClick('exportModalOverlay', () => this.hideExportModal());
        bindClick('closeExportModal', () => this.hideExportModal());
        bindClick('exportCopy', () => this.handleExport('copy'));
        bindClick('exportDownload', () => this.handleExport('download'));

        if (this.exportGridInterval) {
            this.exportGridInterval.addEventListener('input', () => {
                const val = parseInt(this.exportGridInterval.value, 10) || 1;
                if (this.exportGridIntervalValue) this.exportGridIntervalValue.textContent = val;
            });
        }

        if (this.exportShowGrid) {
            const gridOptions = document.getElementById('gridOptions');
            const syncGridOptions = () => {
                if (!gridOptions) return;
                const enabled = this.exportShowGrid.checked;
                gridOptions.classList.toggle('disabled', !enabled);
            };
            this.exportShowGrid.addEventListener('change', syncGridOptions);
            syncGridOptions();
        }

        if (this.exportShowCoords) {
            const coordOptions = document.getElementById('coordOptions');
            const syncCoordOptions = () => {
                if (!coordOptions) return;
                const enabled = this.exportShowCoords.checked;
                coordOptions.classList.toggle('disabled', !enabled);
            };
            this.exportShowCoords.addEventListener('change', syncCoordOptions);
            syncCoordOptions();
        }

        if (this.exportCoordInterval) {
            this.exportCoordInterval.addEventListener('input', () => {
                const val = Math.max(1, parseInt(this.exportCoordInterval.value, 10) || 1);
                if (this.exportCoordIntervalValue) this.exportCoordIntervalValue.textContent = val;
            });
        }

        if (this.exportColorPalette && this.exportGridColor) {
            this.exportColorPalette.querySelectorAll('.color-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    const color = dot.dataset.color;
                    if (!color) return;
                    this.exportGridColor.value = color;
                    this.exportColorPalette.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                    dot.classList.add('selected');
                });
            });
            this.exportGridColor.addEventListener('input', () => {
                const val = this.exportGridColor.value;
                let matched = false;
                this.exportColorPalette.querySelectorAll('.color-dot').forEach(d => {
                    const isMatch = d.dataset.color.toLowerCase() === val.toLowerCase();
                    d.classList.toggle('selected', isMatch);
                    if (isMatch) matched = true;
                });
                if (!matched) {
                    this.exportColorPalette.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                }
            });
        }

        // 颜色合并
        const mergeRange = document.getElementById('mergeThreshold');
        const mergeNumber = document.getElementById('mergeThresholdInput');
        const syncMerge = (val) => {
            const clamped = Math.max(0, Math.min(40, val));
            this.mergeThreshold = clamped;
            if (mergeRange) mergeRange.value = clamped;
            if (mergeNumber) mergeNumber.value = clamped;
        };
        if (mergeRange && mergeNumber) {
            mergeRange.value = this.mergeThreshold;
            mergeNumber.value = this.mergeThreshold;
            mergeRange.addEventListener('input', () => syncMerge(parseFloat(mergeRange.value) || 0));
            mergeNumber.addEventListener('change', () => syncMerge(parseFloat(mergeNumber.value) || 0));
        }

        bindClick('mergeColorsBtn', () => this.mergeSimilarColors());
        bindClick('removeBgBtn', () => this.removeBackground());
    }

    // 移除背景功能
    removeBackground() {
        if (!this.isGenerated || !this.colorGrid.length) {
            this.showToast('请先生成图纸', 'info');
            return;
        }
        
        const rows = this.colorGrid.length;
        const cols = this.colorGrid[0].length;
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue = [];
        
        // 定义背景色号 (透明、白色等)
        // T1: 白色, H1: 透明, H2: 白色
        const BACKGROUND_COLOR_KEYS = ['T1', 'H1', 'H2']; 

        // 辅助函数：检查并添加种子
        const checkAndAddSeed = (r, c) => {
            if (visited[r][c]) return;
            const cell = this.colorGrid[r][c];
            // 必须是背景色之一才作为种子
            if (cell && cell.color && BACKGROUND_COLOR_KEYS.includes(cell.color.id)) {
                visited[r][c] = true;
                queue.push([r, c]);
            }
        };

        // 1. 扫描边界，寻找种子
        // Top & Bottom
        for (let c = 0; c < cols; c++) {
            checkAndAddSeed(0, c);
            checkAndAddSeed(rows - 1, c);
        }
        // Left & Right
        for (let r = 0; r < rows; r++) {
            checkAndAddSeed(r, 0);
            checkAndAddSeed(r, cols - 1);
        }

        if (queue.length === 0) {
            this.showToast('边缘未检测到预设背景色(T1/H1)', 'info');
            return;
        }

        // 2. 洪水填充
        let removedCount = 0;
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (queue.length > 0) {
            const [r, c] = queue.shift();
            const cell = this.colorGrid[r][c];
            
            // 标记并移除
            if (!cell.isExternal) {
                cell.isExternal = true;
                cell.color = null; // 视觉上移除
                removedCount++;
            }

            // 检查邻居
            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
                    const neighbor = this.colorGrid[nr][nc];
                    // 只有颜色也在背景色列表中，才继续蔓延
                    if (neighbor && neighbor.color && BACKGROUND_COLOR_KEYS.includes(neighbor.color.id)) {
                        visited[nr][nc] = true;
                        queue.push([nr, nc]);
                    }
                }
            }
        }

        if (removedCount > 0) {
            this.saveState();
            this.redrawCanvas();
            this.showToast(`已移除 ${removedCount} 个背景格子`, 'success');
        } else {
            this.showToast('未找到可移除的背景区域', 'info');
        }
    }

    // 主题切换
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        const sunIcon = document.querySelector('.theme-icon-sun');
        const moonIcon = document.querySelector('.theme-icon-moon');
        
        if (sunIcon && moonIcon) {
            sunIcon.style.display = isDark ? 'block' : 'none';
            moonIcon.style.display = isDark ? 'none' : 'block';
        }
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            const sunIcon = document.querySelector('.theme-icon-sun');
            const moonIcon = document.querySelector('.theme-icon-moon');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    initNineGridOverlay() {
        if (!this.selectionBox) return;

        const handleStart = (mode) => (e) => {
            if (!this.isSelectingGrid && !this.isCropping) return;
            
            // 如果是多指触摸（如缩放），允许冒泡并不处理拖拽
            if (e.touches && e.touches.length > 1) {
                this.nineGridDrag = null;
                return;
            }

            // 阻止默认行为（如滚动）和冒泡
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();

            const point = e.touches ? e.touches[0] : e;
            this.nineGridDrag = {
                mode,
                startClientX: point.clientX,
                startClientY: point.clientY,
                startState: { ...this.nineGridState }
            };
        };

        this.nineGridHandles.forEach(handle => {
            const mode = handle.dataset.handle;
            handle.addEventListener('mousedown', handleStart(mode));
            handle.addEventListener('touchstart', handleStart(mode), { passive: false });
        });

        // 绑定拖拽区域事件（用于移动整个选框）
        const dragSurface = this.selectionBox.querySelector('.drag-surface');
        if (dragSurface) {
            dragSurface.addEventListener('mousedown', handleStart('move'));
            dragSurface.addEventListener('touchstart', handleStart('move'), { passive: false });
        }

        const handleMove = (e) => {
            // 如果是多指操作，取消拖拽
            if (e.touches && e.touches.length > 1) {
                this.nineGridDrag = null;
                return;
            }

            if (!this.nineGridDrag) return;
            if (e.cancelable) e.preventDefault(); // 防止拖动时滚动页面
            const point = e.touches ? e.touches[0] : e;
            this.onNineGridDrag(point);
        };

        const handleEnd = () => {
            this.endNineGridDrag();
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
    }

    // 图片上传
    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.uploadedImage = img;
                this.showCanvas();
                this.initCanvasWithImage();
                
                // Check image size
                if (img.width < 100 || img.height < 100) {
                    this.showToast('图片尺寸较小，建议放大以获得更好效果', 'info');
                }
                
                // Clear image history on new upload
                this.imageHistory = [];
                this.imageHistoryIndex = -1;
                this.saveImageState(); // Save initial state
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 旋转图片
    rotateImage(direction) {
        if (!this.uploadedImage) return;
        
        const canvas = document.createElement('canvas');
        if (direction === 'left' || direction === 'right') {
            canvas.width = this.uploadedImage.height;
            canvas.height = this.uploadedImage.width;
        } else {
            canvas.width = this.uploadedImage.width;
            canvas.height = this.uploadedImage.height;
        }
        
        const ctx = canvas.getContext('2d');
        const w = this.uploadedImage.width;
        const h = this.uploadedImage.height;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        if (direction === 'left') {
            ctx.rotate(-90 * Math.PI / 180);
        } else if (direction === 'right') {
            ctx.rotate(90 * Math.PI / 180);
        }
        
        ctx.drawImage(this.uploadedImage, -w / 2, -h / 2);
        
        const newImg = new Image();
        newImg.onload = () => {
            this.uploadedImage = newImg;
            this.initCanvasWithImage();
            
            // Save state for undo
            this.saveImageState();
        };
        newImg.src = canvas.toDataURL();
    }

    showCanvas() {
        this.uploadPrompt.style.display = 'none';
        this.canvasWrapper.style.display = 'flex';
        this.canvasInfo.style.display = 'flex';
        if (this.editGuard) this.editGuard.style.display = 'flex';
        this.isGenerated = false;
        this.enableToolbarButtons();
        if (this.toolsSection) this.toolsSection.classList.add('tool-locked');
        const gridSettingsSection = document.getElementById('gridSettingsSection');
        if (gridSettingsSection) gridSettingsSection.style.display = 'block';
        if (this.imageProcessSection) this.imageProcessSection.style.display = 'block';
    }

    enableToolbarButtons() {
        document.getElementById('exportBtn').disabled = false;
        document.getElementById('clearBtn').disabled = false;
    }

    initCanvasWithImage() {
        // 获取画布容器的实际可用空间
        const canvasScroll = document.getElementById('canvasScroll');
        // 增加 dpr 支持以确保高分屏清晰度，并做好兜底
        const dpr = window.devicePixelRatio || 1;
        let containerW = canvasScroll ? canvasScroll.clientWidth : window.innerWidth;
        let containerH = canvasScroll ? canvasScroll.clientHeight : window.innerHeight;
        
        if (containerW <= 0) containerW = window.innerWidth;
        if (containerH <= 0) containerH = window.innerHeight;

        // 使用固定的合理最大尺寸，避免容器尺寸计算问题
        const maxCanvasWidth = 4096;
        const maxCanvasHeight = 4096;
        
        let width = this.uploadedImage.width;
        let height = this.uploadedImage.height;
        
        // 自动调整尺寸逻辑：
        // 1. 无论图片多大，我们都希望它能以“最佳分辨率”显示在屏幕上。
        // 2. 如果图片很小（比如像素画），我们不应该把它拉伸模糊，而是保持原样，但在视图中放大显示（通过 zoom）。
        // 3. 但是为了处理方便，如果图片过大，限制最大尺寸。
        
        // 计算目标尺寸（考虑 dpr 的物理像素）
        // const targetW = containerW * dpr;
        // const targetH = containerH * dpr;
        
        // 不再因为图片小就自动拉大 canvas 的物理尺寸，这样会导致像素模糊。
        // 我们保持图片的原始尺寸（只要不超过最大限制），然后通过 fitImageToView 来缩放视图。
        
        // 再次检查并应用最大尺寸限制
        if (width > maxCanvasWidth || height > maxCanvasHeight) {
            const ratio = Math.min(maxCanvasWidth / width, maxCanvasHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        // 修正画布大小，确保至少为1
        width = Math.max(1, width);
        height = Math.max(1, height);
        
        // 设置画布大小
        this.mainCanvas.width = width;
        this.mainCanvas.height = height;
        
        // 关键：禁用平滑处理，确保像素风格清晰锐利（配合 CSS 的 image-rendering: pixelated）
        this.ctx.imageSmoothingEnabled = false;
        
        // 重置网格选择状态，因为图片尺寸已改变
        this.nineGridState = { x: 0, y: 0, width: 0, height: 0 };
        
        // 直接在画布上绘制原始图片
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(this.uploadedImage, 0, 0, width, height);
        
        // 初始化网格数据 - 使用自动计算的值
        this.autoCalculateGrid();

        // 自动适配图片到视图
        // 使用 setTimeout 确保 DOM 更新及容器尺寸计算正确
        setTimeout(() => {
            this.fitImageToView();
        }, 50);
        
        // 每次初始化画布（意味着图片改变）时，保存状态
        // 注意：initCanvasWithImage 可能被多次调用（如缩放、裁剪后），需要区分是初始化还是修改
        // 这里我们在具体操作（如缩放、裁剪、旋转）完成后手动调用 saveImageState 更可控
        // 或者在这里调用，但要注意避免重复保存。
        // 由于 handleImageUpload 中已经手动保存了初始状态，这里我们不自动保存，
        // 而是让各个操作方法在修改 this.uploadedImage 后调用 saveImageState。
    }
    
    // 图片处理历史记录管理
    saveImageState() {
        if (!this.uploadedImage) return;
        
        // 如果当前不在历史记录末尾（即进行了撤销操作），则丢弃后面的记录
        if (this.imageHistoryIndex < this.imageHistory.length - 1) {
            this.imageHistory = this.imageHistory.slice(0, this.imageHistoryIndex + 1);
        }
        
        // 保存图片数据的副本 (DataURL)
        const canvas = document.createElement('canvas');
        canvas.width = this.uploadedImage.width;
        canvas.height = this.uploadedImage.height;
        canvas.getContext('2d').drawImage(this.uploadedImage, 0, 0);
        
        // 限制历史记录数量，防止内存溢出
        if (this.imageHistory.length >= 10) {
            this.imageHistory.shift();
            this.imageHistoryIndex--;
        }
        
        this.imageHistory.push(canvas.toDataURL());
        this.imageHistoryIndex++;
        
        this.updateUndoImageBtn();
    }
    
    undoImageProcess() {
        if (this.imageHistoryIndex <= 0) return; // 至少保留初始图片
        
        this.imageHistoryIndex--;
        const dataUrl = this.imageHistory[this.imageHistoryIndex];
        
        const img = new Image();
        img.onload = () => {
            this.uploadedImage = img;
            this.initCanvasWithImage(); // Re-render
            this.updateUndoImageBtn();
            this.showToast('已撤销上一步操作', 'info');
        };
        img.src = dataUrl;
    }
    
    updateUndoImageBtn() {
        const btn = document.getElementById('undoImageBtn');
        if (btn) {
            // 如果索引大于0，说明有操作可以撤销（索引0是原始图片）
            btn.disabled = this.imageHistoryIndex <= 0;
            if (btn.disabled) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }
    }
    
    getMaxZoom() {
        // 如果没有图片或画布，给一个默认值
        if (!this.mainCanvas || !this.canvasScroll) return 10;
        
        // 获取容器尺寸
        const containerW = this.canvasScroll.clientWidth;
        const containerH = this.canvasScroll.clientHeight;
        
        // 如果容器不可见，给一个默认值
        if (containerW === 0 || containerH === 0) return 10;
        
        const contentW = this.mainCanvas.width || 100;
        const contentH = this.mainCanvas.height || 100;
        
        // 计算“填满屏幕”所需的缩放比例
        // fitRatio 是让图片完全显示在屏幕内的比例 (contain)
        // fillRatio 是让图片填满屏幕最小边的比例 (cover)
        // 这里我们需要的是最大缩放比例，通常是能够看清像素的级别
        
        // 允许放大到至少能看清每个像素 (例如每个像素占 20px)
        const pixelPeepZoom = 20; 
        
        // 或者是填满屏幕的 2 倍
        const fillZoom = Math.max(containerW / contentW, containerH / contentH) * 2;
        
        return Math.max(pixelPeepZoom, fillZoom, 10);
    }

    fitImageToView() {
        if (!this.mainCanvas || !this.canvasScroll) return;

        // 获取容器尺寸（移除内边距以填满屏幕）
        const containerWidth = this.canvasScroll.clientWidth;
        const containerHeight = this.canvasScroll.clientHeight;
        
        if (containerWidth <= 0 || containerHeight <= 0) return;

        const contentWidth = this.mainCanvas.width;
        const contentHeight = this.mainCanvas.height;

        if (contentWidth <= 0 || contentHeight <= 0) return;

        // 计算适配比例
        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        
        // 取较小的比例以确保图片完全显示 (contain)
        let newZoom = Math.min(scaleX, scaleY);
        
        // 留出一点边距 (例如 5%)，避免贴边太紧，或者按照用户需求“画框不能适应屏幕大小”进行调整
        // 用户反馈：从最上方菜单栏到最下方画布大小显示之间的空间太小，并且会受到图片大小的影响
        // 这通常是因为 flex 布局或者高度计算问题。
        // fitImageToView 只是调整缩放，不影响布局。
        // 但如果 zoom 过大导致溢出，也是问题。
        // 这里我们将默认视图稍微缩小一点点，留出边距。
        newZoom = newZoom * 0.95;
        
        // 限制最小缩放
        newZoom = Math.max(0.01, Math.min(this.getMaxZoom(), newZoom));
        
        // 应用缩放和重置位移
        this.zoomLevel = newZoom;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.updateZoom();
    }

    cloneColorGrid(grid) {
        if (!grid) return null;
        return grid.map(row => row.map(cell => cell ? { ...cell } : cell));
    }

    initializeColorGrid() {
        const { cols, rows } = this.gridData;
        this.colorGrid = [];
        
        for (let row = 0; row < rows; row++) {
            const rowData = [];
            for (let col = 0; col < cols; col++) {
                rowData.push({
                    rgb: { r: 255, g: 255, b: 255 },
                    color: null,
                    alternatives: []
                });
            }
            this.colorGrid.push(rowData);
        }
        
        // 重置对比模式状态
        this.isCompareMode = false;
        const updateCompareBtn = (btn) => {
            if (btn) {
                btn.classList.remove('active');
                const span = btn.querySelector('span');
                if (span) span.textContent = '对比原图/图纸';
            }
        };
        updateCompareBtn(this.toggleCompareBtn);
        updateCompareBtn(this.toggleCompareBtnSidebar);

        this.saveState();
        this.redrawCanvas();
    }

    ensureNineGridState() {
        if (!this.uploadedImage || !this.selectionBox) return;
        if (this.nineGridState.width > 0 && this.nineGridState.height > 0) return;
        // 默认选框占据图片长宽的三分之一，居中
        const defaultWidth = this.mainCanvas.width / 3;
        const defaultHeight = this.mainCanvas.height / 3;
        this.nineGridState = {
            width: defaultWidth,
            height: defaultHeight,
            x: (this.mainCanvas.width - defaultWidth) / 2,
            y: (this.mainCanvas.height - defaultHeight) / 2
        };
    }

    renderNineGridOverlay() {
        if (!this.selectionBox || (!this.isSelectingGrid && !this.isCropping)) return;

        // 使用与 updateGridOverlay() 相同的数学计算方式，确保定位一致性
        const scale = this.zoomLevel;
        const canvasW = this.mainCanvas.width;
        const canvasH = this.mainCanvas.height;
        const scrollW = this.canvasScroll.clientWidth;
        const scrollH = this.canvasScroll.clientHeight;

        // 计算画布在容器中的居中位置（与 CSS transform-origin: center center 一致）
        const scaledW = canvasW * scale;
        const scaledH = canvasH * scale;
        const centerX = scrollW / 2;
        const centerY = scrollH / 2;

        // 计算覆盖层的基础位置，考虑平移偏移
        const baseLeft = centerX - scaledW / 2 + this.panOffsetX;
        const baseTop = centerY - scaledH / 2 + this.panOffsetY;

        const { x, y, width, height } = this.nineGridState;

        // 计算框选区域相对于画布的缩放后位置
        const scaledX = x * scale;
        const scaledY = y * scale;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        this.selectionBox.style.display = 'block';
        this.selectionBox.style.left = (baseLeft + scaledX) + 'px';
        this.selectionBox.style.top = (baseTop + scaledY) + 'px';
        this.selectionBox.style.width = scaledWidth + 'px';
        this.selectionBox.style.height = scaledHeight + 'px';
        
        // 动态生成网格线
        // 清除旧的 grid-line
        this.selectionBox.querySelectorAll('.grid-line').forEach(el => el.remove());
        
        // 仅在框选网格模式下绘制内部网格线
        if (this.isSelectingGrid) {
            const n = this.gridSelectionSize;
            if (n > 1) {
                const fragment = document.createDocumentFragment();
                for (let i = 1; i < n; i++) {
                    const percent = (i / n) * 100;
                    
                    // 垂直线
                    const vLine = document.createElement('div');
                    vLine.className = 'grid-line';
                    vLine.style.left = `${percent}%`;
                    vLine.style.top = '0';
                    vLine.style.width = '1.5px';
                    vLine.style.height = '100%';
                    fragment.appendChild(vLine);
                    
                    // 水平线
                    const hLine = document.createElement('div');
                    hLine.className = 'grid-line';
                    hLine.style.top = `${percent}%`;
                    hLine.style.left = '0';
                    hLine.style.height = '1.5px';
                    hLine.style.width = '100%';
                    fragment.appendChild(hLine);
                }
                this.selectionBox.appendChild(fragment);
            }
        } else if (this.isCropping) {
            // 裁剪模式下通常使用九宫格 (3x3) 辅助
            const n = 3;
            const fragment = document.createDocumentFragment();
            for (let i = 1; i < n; i++) {
                const percent = (i / n) * 100;
                
                // 垂直线
                const vLine = document.createElement('div');
                vLine.className = 'grid-line';
                vLine.style.left = `${percent}%`;
                vLine.style.top = '0';
                vLine.style.width = '1.5px';
                vLine.style.height = '100%';
                fragment.appendChild(vLine);
                
                // 水平线
                const hLine = document.createElement('div');
                hLine.className = 'grid-line';
                hLine.style.top = `${percent}%`;
                hLine.style.left = '0';
                hLine.style.height = '1.5px';
                hLine.style.width = '100%';
                fragment.appendChild(hLine);
            }
            this.selectionBox.appendChild(fragment);
        }
    }

    onNineGridDrag(e) {
        if (!this.nineGridDrag || (!this.isSelectingGrid && !this.isCropping)) return;
        const { mode, startClientX, startClientY, startState } = this.nineGridDrag;

        // 使用统一的坐标转换逻辑，与 screenToCanvasCoords 保持一致
        const { canvasX: currentX, canvasY: currentY } = this.screenToCanvasCoords(e.clientX, e.clientY);
        const { canvasX: startX, canvasY: startY } = this.screenToCanvasCoords(startClientX, startClientY);

        const scale = this.zoomLevel || 1;
        const dxCanvas = currentX - startX;
        const dyCanvas = currentY - startY;
        let { x, y, width, height } = startState;

        const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

        if (mode === 'move') {
            x = clamp(x + dxCanvas, 0, Math.max(0, this.mainCanvas.width - width));
            y = clamp(y + dyCanvas, 0, Math.max(0, this.mainCanvas.height - height));
        } else {
            const minSize = 1;
            // 允许网格扩展到整个画布大小
            const maxWidth = this.mainCanvas.width;
            const maxHeight = this.mainCanvas.height;
            
            if (mode.includes('l')) {
                // 向左拖动：可以扩大也可以缩小
                const newX = clamp(x + dxCanvas, 0, x + width - minSize);
                const newWidth = width + (x - newX);
                // 确保宽度不超过画布边界
                if (newX >= 0 && newWidth <= maxWidth) {
                    width = newWidth;
                    x = newX;
                }
            }
            if (mode.includes('r')) {
                // 向右拖动：可以扩大到画布右边界
                width = clamp(width + dxCanvas, minSize, maxWidth - x);
            }
            if (mode.includes('t')) {
                // 向上拖动：可以扩大也可以缩小
                const newY = clamp(y + dyCanvas, 0, y + height - minSize);
                const newHeight = height + (y - newY);
                // 确保高度不超过画布边界
                if (newY >= 0 && newHeight <= maxHeight) {
                    height = newHeight;
                    y = newY;
                }
            }
            if (mode.includes('b')) {
                // 向下拖动：可以扩大到画布下边界
                height = clamp(height + dyCanvas, minSize, maxHeight - y);
            }
            
            // 磁吸式贴附器：当接近正方形时自动吸附 (仅在框选网格时)
            if (this.isSelectingGrid && !mode.includes('move')) {
                const diff = Math.abs(width - height);
                const threshold = 20 / scale; // 20px threshold in screen space
                if (diff < threshold) {
                    // 吸附到较小的一边，或者平均值？通常吸附到用户意图的那一边。
                    // 简单起见，取平均或者强制相等
                    const size = (width + height) / 2;
                    width = size;
                    height = size;
                }
            }
        }

        this.nineGridState = { x, y, width, height };
        this.renderNineGridOverlay();
        if (this.isSelectingGrid) {
            this.applyNineGridToGridData();
        }
    }

    endNineGridDrag() {
        if (!this.nineGridDrag) return;
        this.nineGridDrag = null;
    }

    applyNineGridToGridData() {
        if (!this.isSelectingGrid) return;
        const cellWidth = this.nineGridState.width / this.gridSelectionSize;
        const cellHeight = this.nineGridState.height / this.gridSelectionSize;
        
        let offsetX = this.nineGridState.x % cellWidth;
        let offsetY = this.nineGridState.y % cellHeight;

        // 如果偏移量大于0，调整为负数，以确保网格覆盖画布左上角
        if (offsetX > 0.01) offsetX -= cellWidth;
        if (offsetY > 0.01) offsetY -= cellHeight;
        
        // 修正接近 0 的负数（浮点误差）
        if (Math.abs(offsetX) < 0.01) offsetX = 0;
        if (Math.abs(offsetY) < 0.01) offsetY = 0;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('gridCols', cellWidth.toFixed(2));
        setVal('gridColsInput', cellWidth.toFixed(2));
        setVal('gridRows', cellHeight.toFixed(2));
        setVal('gridRowsInput', cellHeight.toFixed(2));
        setVal('gridOffsetX', offsetX.toFixed(2));
        setVal('gridOffsetXInput', offsetX.toFixed(2));
        setVal('gridOffsetY', offsetY.toFixed(2));
        setVal('gridOffsetYInput', offsetY.toFixed(2));

        // 直接计算 gridData，避免输入框的 min/max 限制影响选框大小
        const cols = Math.max(1, Math.ceil((this.mainCanvas.width - offsetX) / cellWidth));
        const rows = Math.max(1, Math.ceil((this.mainCanvas.height - offsetY) / cellHeight));

        this.gridData = { cols, rows, offsetX, offsetY, cellWidth, cellHeight };
        if (this.lockGridRatio && cellHeight !== 0) {
            this.gridRatio = cellWidth / cellHeight;
        }
        this.isGenerated = false;
        if (this.editGuard) this.editGuard.style.display = 'flex';
        
        // 重新初始化颜色网格
        this.initializeColorGrid();
        
        document.getElementById('canvasSizeInfo').textContent = `${cols} × ${rows}`;
        // 注意：在框选模式下不调用 updateGridManual，避免输入框限制影响 nineGridState
    }

    updateGridManual() {
        if (!this.uploadedImage) return;
        
        const cellWidth = parseFloat(document.getElementById('gridCols').value);
        const cellHeight = parseFloat(document.getElementById('gridRows').value);
        const offsetX = parseFloat(document.getElementById('gridOffsetX').value);
        const offsetY = parseFloat(document.getElementById('gridOffsetY').value);

        // 计算列数和行数时考虑偏移量，确保覆盖整个画布
        // 当偏移为负时，需要额外的列/行来覆盖右边/下边
        const cols = Math.max(1, Math.ceil((this.mainCanvas.width - offsetX) / cellWidth));
        const rows = Math.max(1, Math.ceil((this.mainCanvas.height - offsetY) / cellHeight));

        this.gridData = { cols, rows, offsetX, offsetY, cellWidth, cellHeight };
        if (this.lockGridRatio && cellHeight !== 0) {
            this.gridRatio = cellWidth / cellHeight;
        }
        this.isGenerated = false;
        if (this.editGuard) this.editGuard.style.display = 'flex';
        
        // 重新初始化颜色网格
        this.initializeColorGrid();
        
        document.getElementById('canvasSizeInfo').textContent = `${cols} × ${rows}`;

        // 同步九宫格大小（保持 3x3）- 仅在用户手动调整输入框时更新（非拖动状态）
        if (this.isSelectingGrid && cellWidth > 0 && cellHeight > 0 && !this.nineGridDrag) {
            this.nineGridState.width = cellWidth * this.gridSelectionSize;
            this.nineGridState.height = cellHeight * this.gridSelectionSize;
            this.renderNineGridOverlay();
        }
    }

    rotateImage(angle) {
        if (!this.uploadedImage) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (Math.abs(angle) === 90) {
            canvas.width = this.uploadedImage.height;
            canvas.height = this.uploadedImage.width;
        } else {
            canvas.width = this.uploadedImage.width;
            canvas.height = this.uploadedImage.height;
        }
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(this.uploadedImage, -this.uploadedImage.width / 2, -this.uploadedImage.height / 2);
        
        const newImg = new Image();
        newImg.onload = () => {
            this.uploadedImage = newImg;
            this.initCanvasWithImage();
        };
        newImg.src = canvas.toDataURL();
    }

    toggleCropMode() {
        if (this.isCropping) {
            this.cancelCrop();
        } else {
            this.startCrop();
        }
    }

    startCrop() {
        if (!this.uploadedImage) return;
        this.closeMobileMenus();
        // Close other modes
        if (this.isSelectingGrid) this.endGridSelection();
        
        const isActive = this.resizeBtn && this.resizeBtn.classList.contains('active');
        if (isActive) this.cancelResize();
        if (this.isAdjustingContrast) this.cancelContrast();

        this.isCropping = true;
        this.cropBtn.classList.add('active');
        this.cropActions.style.display = 'block';
        this.canvasScroll.classList.add('selecting-mode');
        
        // Initialize crop box to 80% of canvas
        this.nineGridState = {
            x: this.mainCanvas.width * 0.1,
            y: this.mainCanvas.height * 0.1,
            width: this.mainCanvas.width * 0.8,
            height: this.mainCanvas.height * 0.8
        };
        
        this.selectionBox.classList.add('crop-mode');
        this.renderNineGridOverlay();
        
        // Disable grid interaction/drawing
        this.mainCanvas.style.pointerEvents = 'none';
    }

    cancelCrop() {
        this.isCropping = false;
        this.cropBtn.classList.remove('active');
        this.cropActions.style.display = 'none';
        this.canvasScroll.classList.remove('selecting-mode');
        this.selectionBox.style.display = 'none';
        this.selectionBox.classList.remove('crop-mode');
        this.mainCanvas.style.pointerEvents = 'auto';
        this.nineGridDrag = null;
        this.updateCursor();
    }

    toggleResizeMode() {
        if (!this.uploadedImage) return;
        this.closeMobileMenus();
        
        // Close other modes if necessary
        if (this.isSelectingGrid) this.endGridSelection();
        if (this.isCropping) this.cancelCrop();
        if (this.isAdjustingContrast) this.cancelContrast();

        const isActive = this.resizeBtn.classList.contains('active');
        if (isActive) {
            this.cancelResize();
        } else {
            this.resizeBtn.classList.add('active');
            this.resizeActions.style.display = 'block';
            
            // Init values
            this.resizeWidth.value = this.uploadedImage.width;
            this.resizeHeight.value = this.uploadedImage.height;
            const scaleSlider = document.getElementById('resizeScale');
            const scaleValue = document.getElementById('resizeScaleValue');
            if (scaleSlider) scaleSlider.value = 1;
            if (scaleValue) scaleValue.textContent = '1.0x';
        }
    }

    confirmResize() {
        if (!this.uploadedImage) return;
        
        const w = parseInt(this.resizeWidth.value);
        const h = parseInt(this.resizeHeight.value);
        
        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            this.showToast('请输入有效的宽高', 'error');
            return;
        }
        
        const algorithm = this.resizeAlgorithm.value;
        
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // Set smoothing
        if (algorithm === 'pixelated') {
            ctx.imageSmoothingEnabled = false;
        } else {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }
        
        ctx.drawImage(this.uploadedImage, 0, 0, w, h);
        
        const newImg = new Image();
        newImg.onload = () => {
            this.uploadedImage = newImg;
            this.initCanvasWithImage();
            this.cancelResize();
            this.showToast(`图片缩放为 ${w}x${h}`, 'success');
            
            // Save state for undo
            this.saveImageState();
        };
        newImg.src = canvas.toDataURL();
    }

    cancelResize() {
        this.resizeBtn.classList.remove('active');
        this.resizeActions.style.display = 'none';
    }

    confirmCrop() {
        if (!this.isCropping) return;
        
        const { x, y, width, height } = this.nineGridState;
        
        // Create new image from crop area
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw only the cropped part from mainCanvas
        // 注意：mainCanvas 上已经绘制了原始图片，且大小是按比例缩放过的。
        // uploadedImage 是原始图片。
        // 最好直接从 mainCanvas 截取，因为用户看到的是 mainCanvas。
        // 但是为了保持清晰度，应该尽可能从 uploadedImage 截取？
        // initCanvasWithImage 中 mainCanvas 是被缩放过的（如果图片过大）。
        // 这里为了简单和所见即所得，我们直接截取 mainCanvas 的内容作为新的 uploadedImage。
        // 但是要注意 mainCanvas 上可能还有网格线（如果 showGridLines 为 true）。
        // 我们应该重新绘制一遍纯图片到临时 canvas 上再截取，或者计算对应 uploadedImage 的坐标。
        
        // 方案：计算相对于原始图片的坐标
        const scaleX = this.uploadedImage.width / this.mainCanvas.width;
        const scaleY = this.uploadedImage.height / this.mainCanvas.height;
        
        const sourceX = x * scaleX;
        const sourceY = y * scaleY;
        const sourceW = width * scaleX;
        const sourceH = height * scaleY;
        
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = sourceW;
        cropCanvas.height = sourceH;
        const cropCtx = cropCanvas.getContext('2d');
        
        cropCtx.drawImage(this.uploadedImage, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
        
        const newImg = new Image();
        newImg.onload = () => {
            this.uploadedImage = newImg;
            this.cancelCrop(); // cancelCrop already handles overlayMask
            this.initCanvasWithImage();
            
            // Save state for undo
            this.saveImageState();
        };
        newImg.src = cropCanvas.toDataURL();
    }

    toggleContrastMode() {
        if (this.isAdjustingContrast) {
            this.cancelContrast();
        } else {
            this.startContrast();
        }
    }

    startContrast() {
        if (!this.uploadedImage) return;
        this.closeMobileMenus();
        if (this.isSelectingGrid) this.endGridSelection();
        if (this.isCropping) this.cancelCrop();
        
        const isActive = this.resizeBtn && this.resizeBtn.classList.contains('active');
        if (isActive) this.cancelResize();

        this.isAdjustingContrast = true;
        this.contrastValue = 0;
        if (this.contrastBtn) this.contrastBtn.classList.add('active');
        if (this.contrastActions) this.contrastActions.style.display = 'block';
        if (this.contrastSlider) this.contrastSlider.value = 0;
        if (this.contrastValueDisplay) this.contrastValueDisplay.textContent = '0';
        
        this.redrawCanvas();
    }

    cancelContrast() {
        this.isAdjustingContrast = false;
        this.contrastValue = 0;
        if (this.contrastBtn) this.contrastBtn.classList.remove('active');
        if (this.contrastActions) this.contrastActions.style.display = 'none';
        this.redrawCanvas();
    }

    confirmContrast() {
        if (!this.isAdjustingContrast || !this.uploadedImage) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = this.uploadedImage.width;
        canvas.height = this.uploadedImage.height;
        const ctx = canvas.getContext('2d');
        
        ctx.filter = `contrast(${100 + this.contrastValue}%)`;
        ctx.drawImage(this.uploadedImage, 0, 0);
        
        const newImg = new Image();
        newImg.onload = () => {
            this.uploadedImage = newImg;
            this.cancelContrast();
            this.initCanvasWithImage();
            
            // Save state for undo
            this.saveImageState();
        };
        newImg.src = canvas.toDataURL();
    }

    updateContrastPreview() {
        this.redrawCanvas();
    }

    switchWorkspace(workspace) {
        this.currentWorkspace = workspace;
        
        // Update Tabs
        this.workspaceTabs.forEach(tab => {
            if (tab.dataset.ws === workspace) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Toggle UI Panels
        if (this.genSidebarContent) this.genSidebarContent.style.display = 'none';
        if (this.editSidebarContent) this.editSidebarContent.style.display = 'none';
        const identifySidebar = document.getElementById('identify-sidebar-content');
        if (identifySidebar) identifySidebar.style.display = 'none';
        
        if (this.genToolbar) this.genToolbar.style.display = 'none';
        if (this.editToolbar) this.editToolbar.style.display = 'none';

        if (workspace === 'generation') {
            if (this.genSidebarContent) this.genSidebarContent.style.display = 'block';
            if (this.genToolbar) this.genToolbar.style.display = 'flex';
            
            // Reset state for generation view
            this.isCompareMode = false;
            const updateCompareBtn = (btn) => {
                if (btn) {
                    btn.classList.remove('active');
                    const span = btn.querySelector('span');
                    if (span && !btn.classList.contains('tool-btn')) {
                         span.textContent = '对比原图/图纸';
                    }
                }
            };
            updateCompareBtn(this.toggleCompareBtn);
            updateCompareBtn(this.toggleCompareBtnSidebar);
        } else if (workspace === 'editing') {
            if (this.editSidebarContent) this.editSidebarContent.style.display = 'block';
            if (this.editToolbar) this.editToolbar.style.display = 'flex';
        } else if (workspace === 'identify') {
            if (identifySidebar) identifySidebar.style.display = 'block';
        }

        this.redrawCanvas();
        this.updateCursor();
    }

    toggleCompare() {
        if (!this.isGenerated) {
            this.showToast('请先生成图纸', 'info');
            return;
        }
        this.isCompareMode = !this.isCompareMode;
        
        const updateCompareBtn = (btn) => {
            if (!btn) return;
            if (this.isCompareMode) {
                btn.classList.add('active');
                const span = btn.querySelector('span');
                if (span) span.textContent = '显示原图';
            } else {
                btn.classList.remove('active');
                const span = btn.querySelector('span');
                if (span) span.textContent = '对比原图/图纸';
            }
        };

        updateCompareBtn(this.toggleCompareBtn);
        updateCompareBtn(this.toggleCompareBtnSidebar);

        this.redrawCanvas();
    }

    sendToEdit() {
        if (!this.isGenerated) {
            this.analyzeColors(); // Try to generate first
        }
        if (this.isGenerated) {
            this.switchWorkspace('editing');
            this.showToast('已切换到编辑模式', 'success');
        }
    }

    autoCalculateGrid() {
        if (!this.uploadedImage) {
            this.showToast('请先上传图片', 'error');
            return;
        }
        
        let cellWidth, cellHeight;

        // 尝试基于图像内容检测网格
        try {
            // 创建临时画布获取图像数据
            const tempCanvas = document.createElement('canvas');
            // 限制分析尺寸以提高性能
            const maxAnalysisSize = 1024;
            let scale = 1;
            if (this.mainCanvas.width > maxAnalysisSize || this.mainCanvas.height > maxAnalysisSize) {
                scale = Math.min(maxAnalysisSize / this.mainCanvas.width, maxAnalysisSize / this.mainCanvas.height);
            }
            
            tempCanvas.width = Math.round(this.mainCanvas.width * scale);
            tempCanvas.height = Math.round(this.mainCanvas.height * scale);
            
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            const detected = this.detectGridIntervals(imageData);
            
            if (detected && detected.cellWidth && detected.cellHeight) {
                // 还原比例
                cellWidth = detected.cellWidth / scale;
                cellHeight = detected.cellHeight / scale;
                // 简单的防抖动/微调：如果是整数附近的数，取整
                if (Math.abs(cellWidth - Math.round(cellWidth)) < 0.1) cellWidth = Math.round(cellWidth);
                if (Math.abs(cellHeight - Math.round(cellHeight)) < 0.1) cellHeight = Math.round(cellHeight);
            }
        } catch (e) {
            console.warn('Grid detection failed:', e);
        }

        // 如果检测失败或未检测到，使用默认启发式算法
        if (!cellWidth || !cellHeight) {
            // 根据图片宽高比计算最佳网格
            const imageAspect = this.uploadedImage.width / this.uploadedImage.height;
            
            // 目标是生成 30-80 行的网格（适合拼豆制作）
            let targetRows = Math.round(this.mainCanvas.height / 15); // 每个珠子约15px
            targetRows = Math.max(30, Math.min(80, targetRows));
            
            // 根据宽高比计算列数
            const targetCols = Math.round(targetRows * imageAspect);
    
            cellWidth = this.mainCanvas.width / targetCols;
            cellHeight = this.mainCanvas.height / targetRows;
        }

        const cols = Math.max(1, Math.round(this.mainCanvas.width / cellWidth));
        const rows = Math.max(1, Math.round(this.mainCanvas.height / cellHeight));
        
        // 更新滑块值
        document.getElementById('gridCols').value = cellWidth.toFixed(2);
        document.getElementById('gridColsInput').value = cellWidth.toFixed(2);
        document.getElementById('gridRows').value = cellHeight.toFixed(2);
        document.getElementById('gridRowsInput').value = cellHeight.toFixed(2);
        document.getElementById('gridOffsetX').value = 0;
        document.getElementById('gridOffsetXInput').value = 0;
        document.getElementById('gridOffsetY').value = 0;
        document.getElementById('gridOffsetYInput').value = 0;
        
        // 应用新网格
        this.gridData = { cols, rows, offsetX: 0, offsetY: 0, cellWidth, cellHeight };
        this.isGenerated = false;
        if (this.editGuard) this.editGuard.style.display = 'flex';
        this.initializeColorGrid();
        document.getElementById('canvasSizeInfo').textContent = `${cols} × ${rows}`;
        if (this.lockGridRatio) {
            this.gridRatio = cellWidth / cellHeight;
        }
    }

    detectGridIntervals(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        const rowSums = new Float32Array(height).fill(0);
        const colSums = new Float32Array(width).fill(0);
        
        // 边缘检测与投影
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                const val = (r + g + b) / 3;
                
                let dx = 0, dy = 0;
                if (x < width - 1) {
                    const i_right = (y * width + (x+1)) * 4;
                    const val_right = (data[i_right] + data[i_right+1] + data[i_right+2]) / 3;
                    dx = Math.abs(val - val_right);
                }
                if (y < height - 1) {
                    const i_bottom = ((y+1) * width + x) * 4;
                    const val_bottom = (data[i_bottom] + data[i_bottom+1] + data[i_bottom+2]) / 3;
                    dy = Math.abs(val - val_bottom);
                }
                
                // 垂直线在水平方向上有变化，累加到 colSums
                colSums[x] += dx;
                // 水平线在垂直方向上有变化，累加到 rowSums
                rowSums[y] += dy;
            }
        }
        
        const findPeriod = (sums) => {
            // 简单的峰值检测
            const peaks = [];
            // 动态阈值：平均值的 1.2 倍
            const threshold = sums.reduce((a,b) => a+b, 0) / sums.length * 1.2;
            
            // 寻找局部最大值
            for (let i = 2; i < sums.length - 2; i++) {
                if (sums[i] > threshold && 
                    sums[i] > sums[i-1] && 
                    sums[i] > sums[i-2] && 
                    sums[i] > sums[i+1] && 
                    sums[i] > sums[i+2]) {
                    peaks.push(i);
                }
            }
            
            if (peaks.length < 3) return null;
            
            // 计算峰值间距
            const distances = [];
            for (let i = 1; i < peaks.length; i++) {
                distances.push(peaks[i] - peaks[i-1]);
            }
            
            // 统计最常见的间距（直方图）
            const buckets = {};
            distances.forEach(d => {
                const bucket = Math.round(d);
                if (bucket < 5) return; // 忽略过小的网格
                buckets[bucket] = (buckets[bucket] || 0) + 1;
            });
            
            let bestDist = null;
            let maxCount = 0;
            
            for (const [dist, count] of Object.entries(buckets)) {
                // 简单加权：如果是倍数关系，可能需要合并？暂不处理
                if (count > maxCount) {
                    maxCount = count;
                    bestDist = parseInt(dist);
                }
            }
            
            // 只有当某种间距出现的频率足够高时才采纳
            if (maxCount >= Math.min(5, distances.length * 0.3)) {
                return bestDist;
            }
            return null;
        };
        
        const cellWidth = findPeriod(colSums);
        const cellHeight = findPeriod(rowSums);
        
        return { cellWidth, cellHeight };
    }

    resizeColorGrid(newCols, newRows) {
        const oldGrid = this.colorGrid;
        const newGrid = [];
        
        for (let row = 0; row < newRows; row++) {
            const rowData = [];
            for (let col = 0; col < newCols; col++) {
                if (row < oldGrid.length && col < oldGrid[0].length) {
                    rowData.push(oldGrid[row][col]);
                } else {
                    rowData.push({
                        rgb: { r: 255, g: 255, b: 255 },
                        color: null,
                        alternatives: []
                    });
                }
            }
            newGrid.push(rowData);
        }
        
        this.colorGrid = newGrid;
        this.saveState();
    }

    updateZoom() {
        document.getElementById('zoomValue').textContent = Math.round(this.zoomLevel * 100) + '%';
        const scale = this.zoomLevel;
        this.mainCanvas.style.transform = `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${scale})`;
        this.mainCanvas.style.transformOrigin = 'center center';
        this.updateCursor();
        if (this.isSelectingGrid || this.isCropping) {
            // 在布局更新后再绘制，避免缩放过渡抖动
            requestAnimationFrame(() => this.renderNineGridOverlay());
        }
        // 更新游离式网格覆盖层
        this.updateGridOverlay();
    }

    /**
     * 更新游离式网格覆盖层 - 使用 CSS 绘制网格线，与图片分离
     * 保持网格线粗细在任何缩放级别下都一致为 1px
     */
    updateGridOverlay() {
        if (!this.gridOverlay || !this.mainCanvas || !this.canvasScroll) return;
        
        // 框选模式下不显示主网格覆盖层
        if (this.isSelectingGrid || this.isCropping) {
            this.gridOverlay.style.display = 'none';
            return;
        }
        
        // 如果不需要显示网格线，隐藏覆盖层
        if (!this.showGridLines) {
            this.gridOverlay.style.display = 'none';
            return;
        }
        
        // 获取网格参数
        const cols = this.colorGrid.length > 0 ? this.colorGrid[0].length : (this.gridData ? this.gridData.cols : 0);
        const rows = this.colorGrid.length > 0 ? this.colorGrid.length : (this.gridData ? this.gridData.rows : 0);
        
        if (cols <= 0 || rows <= 0) {
            this.gridOverlay.style.display = 'none';
            return;
        }
        
        const { offsetX = 0, offsetY = 0, cellWidth: storedW, cellHeight: storedH } = this.gridData || {};
        const cellWidth = storedW || this.mainCanvas.width / cols;
        const cellHeight = storedH || this.mainCanvas.height / rows;
        
        const scale = this.zoomLevel;
        const canvasW = this.mainCanvas.width;
        const canvasH = this.mainCanvas.height;
        const scrollW = this.canvasScroll.clientWidth;
        const scrollH = this.canvasScroll.clientHeight;
        
        // 计算画布在容器中的居中位置（与 CSS transform-origin: center center 一致）
        const scaledW = canvasW * scale;
        const scaledH = canvasH * scale;
        const centerX = scrollW / 2;
        const centerY = scrollH / 2;
        
        // 计算覆盖层的位置，考虑平移偏移
        const overlayLeft = centerX - scaledW / 2 + this.panOffsetX;
        const overlayTop = centerY - scaledH / 2 + this.panOffsetY;
        
        // 显示覆盖层并设置位置和大小
        this.gridOverlay.style.display = 'block';
        this.gridOverlay.style.left = `${overlayLeft}px`;
        this.gridOverlay.style.top = `${overlayTop}px`;
        this.gridOverlay.style.width = `${scaledW}px`;
        this.gridOverlay.style.height = `${scaledH}px`;
        
        // 计算缩放后的偏移和单元格尺寸
        // const scaledOffsetX = offsetX * scale;
        // const scaledOffsetY = offsetY * scale;
        // const scaledCellWidth = cellWidth * scale;
        // const scaledCellHeight = cellHeight * scale;
        
        // 清空现有网格线
        this.gridOverlay.innerHTML = '';
        
        // 创建文档片段以提高性能
        const fragment = document.createDocumentFragment();
        
        // 绘制垂直线
        for (let col = 0; col <= cols; col++) {
            // 恢复使用浮点数计算，让浏览器/Canvas处理对齐
            const rawX = offsetX + col * cellWidth;
            const x = rawX * scale;
            if (x >= -1 && x <= scaledW + 1) {
                const line = document.createElement('div');
                line.className = 'grid-line grid-line-v';
                line.style.left = `${x}px`;
                fragment.appendChild(line);
            }
        }
        
        // 绘制水平线
        for (let row = 0; row <= rows; row++) {
            // 恢复使用浮点数计算，让浏览器/Canvas处理对齐
            const rawY = offsetY + row * cellHeight;
            const y = rawY * scale;
            if (y >= -1 && y <= scaledH + 1) {
                const line = document.createElement('div');
                line.className = 'grid-line grid-line-h';
                line.style.top = `${y}px`;
                fragment.appendChild(line);
            }
        }
        
        this.gridOverlay.appendChild(fragment);
    }

    // 应用平移边界限制
    applyPanBounds() {
        if (!this.mainCanvas) return;
        const maxOffset = Math.max(this.mainCanvas.width, this.mainCanvas.height) * this.zoomLevel;
        this.panOffsetX = Math.max(-maxOffset, Math.min(maxOffset, this.panOffsetX));
        this.panOffsetY = Math.max(-maxOffset, Math.min(maxOffset, this.panOffsetY));
    }

    // 滚轮缩放处理
    onCanvasWheel(e) {
        e.preventDefault();
        
        // 获取缩放增量
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(this.getMaxZoom(), this.zoomLevel + delta));
        
        if (newZoom !== this.zoomLevel) {
            const oldZoom = this.zoomLevel;
            this.zoomLevel = newZoom;
            
            // 缩放时按比例调整平移偏移，保持视觉中心相对稳定
            const zoomRatio = newZoom / oldZoom;
            this.panOffsetX *= zoomRatio;
            this.panOffsetY *= zoomRatio;
            
            // 应用边界限制
            const maxOffset = Math.max(this.mainCanvas.width, this.mainCanvas.height) * this.zoomLevel;
            this.panOffsetX = Math.max(-maxOffset, Math.min(maxOffset, this.panOffsetX));
            this.panOffsetY = Math.max(-maxOffset, Math.min(maxOffset, this.panOffsetY));
            
            this.updateZoom();
        }
    }

    // 触摸开始
    onTouchStart(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            // 计算两个触摸点之间的距离
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.touchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    }

    // 触摸移动
    onTouchMove(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            
            // 计算新的触摸距离
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const newDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (this.touchDistance > 0) {
                // 计算缩放比例
                const scale = newDistance / this.touchDistance;
                const oldZoom = this.zoomLevel;
                const newZoom = Math.max(0.1, Math.min(this.getMaxZoom(), this.zoomLevel * scale));
                
                // 按比例调整平移偏移
                const zoomRatio = newZoom / oldZoom;
                this.panOffsetX *= zoomRatio;
                this.panOffsetY *= zoomRatio;
                
                this.zoomLevel = newZoom;
                this.applyPanBounds();
                this.updateZoom();
            }
            
            this.touchDistance = newDistance;
        }
    }

    // 触摸结束
    onTouchEnd() {
        this.touchDistance = 0;
    }

    startPan(e) {
        // Allow pan if tool is pan, OR if middle button, OR if in selection/crop mode (and didn't hit a handle)
        const isPanTool = this.selectedTool === 'pan';
        const isMiddleButton = e.button === 1;
        const isSelectionMode = this.isSelectingGrid || this.isCropping;
        
        // 在选择/裁剪模式下，检查是否点击在选框外部（允许拖动背景）
        if (isSelectionMode && this.selectionBox && this.nineGridDrag === null) {
            // 检查点击位置是否在选框外部
            const boxRect = this.selectionBox.getBoundingClientRect();
            const clickX = e.clientX;
            const clickY = e.clientY;
            const isOutsideBox = clickX < boxRect.left || clickX > boxRect.right || 
                                 clickY < boxRect.top || clickY > boxRect.bottom;
            
            if (isOutsideBox) {
                // 在选框外部点击，允许拖动背景
                this.isPanning = true;
                this.canvasScroll.style.cursor = 'grabbing';
                this.panStart = {
                    x: e.clientX,
                    y: e.clientY,
                    offsetX: this.panOffsetX,
                    offsetY: this.panOffsetY
                };
                e.preventDefault();
                return true;
            }
            // 在选框内部或边缘，不启动拖动（让选框处理）
            return false;
        }
        
        if (!isPanTool && !isMiddleButton && !isSelectionMode) return false;
        
        this.isPanning = true;
        this.canvasScroll.style.cursor = 'grabbing';
        this.panStart = {
            x: e.clientX,
            y: e.clientY,
            offsetX: this.panOffsetX,
            offsetY: this.panOffsetY
        };
        e.preventDefault();
        return true;
    }

    movePan(e) {
        if (!this.isPanning) return;
        const dx = e.clientX - this.panStart.x;
        const dy = e.clientY - this.panStart.y;
        
        // 计算新的偏移值
        let newOffsetX = this.panStart.offsetX + dx;
        let newOffsetY = this.panStart.offsetY + dy;
        
        // 添加边界限制，防止画布被拖得太远
        const maxOffset = Math.max(this.mainCanvas.width, this.mainCanvas.height) * this.zoomLevel;
        newOffsetX = Math.max(-maxOffset, Math.min(maxOffset, newOffsetX));
        newOffsetY = Math.max(-maxOffset, Math.min(maxOffset, newOffsetY));
        
        this.panOffsetX = newOffsetX;
        this.panOffsetY = newOffsetY;
        this.updateZoom();
        e.preventDefault();
    }

    endPan() {
        if (!this.isPanning) return;
        this.isPanning = false;
        this.updateCursor();
    }

    redrawCanvas() {
        if (!this.colorGrid.length && !this.uploadedImage) return;
        
        const cols = this.colorGrid.length > 0 ? this.colorGrid[0].length : (this.gridData ? this.gridData.cols : 1);
        const rows = this.colorGrid.length > 0 ? this.colorGrid.length : (this.gridData ? this.gridData.rows : 1);
        const { offsetX = 0, offsetY = 0, cellWidth: storedW, cellHeight: storedH } = this.gridData || {};
        const cellWidth = storedW || this.mainCanvas.width / cols;
        const cellHeight = storedH || this.mainCanvas.height / rows;
        
        this.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // 确保绘制清晰
        this.ctx.imageSmoothingEnabled = false;
        
        // Determine what to render
        let showSourceImage = false;

        if (this.currentWorkspace === 'generation') {
            // In Generation mode:
            // Show source if:
            // 1. Not generated yet
            // 2. Adjusting contrast
            // 3. Not in compare mode (Compare mode = show result)
            if (!this.isGenerated || this.isAdjustingContrast || !this.isCompareMode) {
                showSourceImage = true;
            }
        } else {
            // In Editing mode:
            // Show result. Fallback to source if not generated.
            if (!this.isGenerated) {
                showSourceImage = true;
            }
        }

        // 如果没有分析过颜色，显示原始图片
        if (showSourceImage && this.uploadedImage) {
            
            // 应用对比度滤镜
            if (this.isAdjustingContrast) {
                this.ctx.filter = `contrast(${100 + this.contrastValue}%)`;
            }

            this.ctx.drawImage(this.uploadedImage, 0, 0, this.mainCanvas.width, this.mainCanvas.height);
            
            this.ctx.filter = 'none';

            // 网格线已改为使用游离式 CSS 覆盖层绘制，在 updateGridOverlay() 中处理
        } else if (this.colorGrid.length > 0) {
            // 绘制颜色单元格 (Pixel Art) - 不再在 canvas 上绘制网格线
            // 使用离屏 Canvas 绘制 1x1 像素，然后拉伸显示，解决网格不等间距问题
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cols;
            tempCanvas.height = rows;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 构造 ImageData
            const imgData = tempCtx.createImageData(cols, rows);
            const data = imgData.data;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = this.colorGrid[row][col];
                    const index = (row * cols + col) * 4;
                    
                    if (cell && cell.color) {
                        const { r, g, b } = cell.color.rgb;
                        data[index] = r;
                        data[index + 1] = g;
                        data[index + 2] = b;
                        data[index + 3] = 255;
                    } else {
                        // White
                        data[index] = 255;
                        data[index + 1] = 255;
                        data[index + 2] = 255;
                        data[index + 3] = 255;
                    }
                }
            }
            
            tempCtx.putImageData(imgData, 0, 0);
            
            // 拉伸绘制到主 Canvas
            // 注意：cellWidth/Height 是浮点数，drawImage 会处理对齐
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.drawImage(
                tempCanvas, 
                0, 0, cols, rows,
                offsetX, offsetY, cols * cellWidth, rows * cellHeight
            );
        }
        
        this.updateUsedColorsPalette();
        this.updateColorStats();
        
        // 更新游离式网格覆盖层
        this.updateGridOverlay();
    }

    // 画布交互
    onCanvasMouseDown(e) {
        if (this.isSelectingGrid || this.isCropping) {
            // Attempt to pan first (if not blocked by selection box stopPropagation)
            this.startPan(e);
            return;
        }
        if (this.selectedTool === 'pan' || e.button === 1) {
            if (this.startPan(e)) return;
            // 拖动工具下即便无法拖动也不进入绘制
            if (this.selectedTool === 'pan') return;
        }
        this.isDrawing = true;
        this.handleCanvasAction(e);
    }

    onCanvasMouseMove(e) {
        if (this.isPanning) {
            this.movePan(e);
            return;
        }
        if (!this.isDrawing) return;
        this.handleCanvasAction(e);
    }

    onCanvasMouseUp() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
        if (this.isPanning) this.endPan();
    }

    updateCursor() {
        // 清除所有工具类
        this.mainCanvas.classList.remove(
            'cursor-pan', 'cursor-brush', 'cursor-bucket', 
            'cursor-replace', 'cursor-eraser', 'cursor-eyedropper'
        );
        this.canvasScroll.style.cursor = '';
        this.mainCanvas.style.cursor = '';

        if (this.isSelectingGrid || this.isCropping) {
            this.mainCanvas.style.cursor = 'crosshair';
            this.canvasScroll.style.cursor = 'crosshair';
            return;
        }

        if (this.currentWorkspace === 'identify') {
            this.mainCanvas.style.cursor = 'crosshair';
            return;
        }

        if (this.selectedTool) {
            this.mainCanvas.classList.add(`cursor-${this.selectedTool}`);
            if (this.selectedTool === 'pan') {
                this.canvasScroll.style.cursor = 'grab'; // 拖动模式下整个区域都可拖动
            }
        }
    }

    handleCanvasAction(e) {
        if (!this.isGenerated && this.currentWorkspace !== 'identify') {
            if (this.editGuard) this.editGuard.style.display = 'flex';
            return;
        }
        const { canvasX: x, canvasY: y } = this.screenToCanvasCoords(e.clientX, e.clientY);

        if (this.currentWorkspace === 'identify') {
            this.identifyColorAt(x, y);
            return;
        }
        
        const cols = this.colorGrid[0].length;
        const rows = this.colorGrid.length;
        const { offsetX = 0, offsetY = 0, cellWidth: storedW, cellHeight: storedH } = this.gridData || {};
        const cellWidth = storedW || this.mainCanvas.width / cols;
        const cellHeight = storedH || this.mainCanvas.height / rows;
        
        const col = Math.floor((x - offsetX) / cellWidth);
        const row = Math.floor((y - offsetY) / cellHeight);
        
        if (col < 0 || col >= cols || row < 0 || row >= rows) return;
        
        switch (this.selectedTool) {
            case 'brush':
                if (this.selectedColor) {
                    this.colorGrid[row][col].color = this.selectedColor;
                    this.redrawCanvas();
                }
                break;
            case 'bucket':
                if (this.selectedColor) {
                    const targetColor = this.colorGrid[row][col].color;
                    this.floodFill(col, row, targetColor, this.selectedColor);
                    this.redrawCanvas();
                    this.saveState();
                }
                break;
            case 'replace': {
                if (!this.selectedColor) {
                    this.showToast('请先选择一个颜色', 'info');
                    return;
                }
                const targetCell = this.colorGrid[row][col];
                const targetId = targetCell && targetCell.color ? targetCell.color.id : null;
                if (!targetId) return;
                if (targetId === this.selectedColor.id) return;

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const cell = this.colorGrid[r][c];
                        if (cell && cell.color && cell.color.id === targetId) {
                            cell.color = this.selectedColor;
                        }
                    }
                }
                this.redrawCanvas();
                this.saveState();
                break;
            }
            case 'eraser':
                this.colorGrid[row][col].color = null;
                this.redrawCanvas();
                break;
            case 'eyedropper':
                const cell = this.colorGrid[row][col];
                if (cell && cell.color) {
                    this.selectedColor = cell.color;
                    this.selectColorInPalette(cell.color);
                }
                break;
        }
    }

    floodFill(startCol, startRow, targetColor, fillColor) {
        if (!targetColor && !fillColor) return;
        if (targetColor && fillColor && targetColor.id === fillColor.id) return;
        
        const stack = [[startCol, startRow]];
        const visited = new Set();
        const targetId = targetColor ? targetColor.id : null;
        
        while (stack.length > 0) {
            const [col, row] = stack.pop();
            const key = `${col},${row}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (row < 0 || row >= this.colorGrid.length) continue;
            if (col < 0 || col >= this.colorGrid[0].length) continue;
            
            const cell = this.colorGrid[row][col];
            const cellId = cell.color ? cell.color.id : null;
            
            if (cellId !== targetId) continue;
            
            cell.color = fillColor;
            
            stack.push([col + 1, row]);
            stack.push([col - 1, row]);
            stack.push([col, row + 1]);
            stack.push([col, row - 1]);
        }
    }

    // 分析颜色
    analyzeColors() {
        if (!this.uploadedImage || !this.gridData) {
            this.showToast('请先上传图片', 'error');
            return;
        }
        
        const { cols, rows, offsetX = 0, offsetY = 0, cellWidth: storedW, cellHeight: storedH } = this.gridData;
        const cellWidth = storedW || this.mainCanvas.width / cols;
        const cellHeight = storedH || this.mainCanvas.height / rows;
        
        // 创建临时画布获取图像数据（与当前画布一致的尺寸）
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.mainCanvas.width;
        tempCanvas.height = this.mainCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 分析每个单元格的颜色
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * cellWidth + offsetX;
                const y = row * cellHeight + offsetY;
                
                // 确保采样区域在画布范围内，避免边缘像素丢失
                // 允许超出一点点，getCellColor 会做边界检查
                
                const cellColor = this.getCellColor(imageData, x, y, cellWidth, cellHeight, tempCanvas.width, tempCanvas.height);
                const hasColor = !!cellColor;
                const closestColors = hasColor ? window.findClosestColors(cellColor) : [];

                if (!this.colorGrid[row]) this.colorGrid[row] = [];
                this.colorGrid[row][col] = {
                    rgb: cellColor || { r: 255, g: 255, b: 255 },
                    color: hasColor ? closestColors[0] : null,
                    alternatives: hasColor ? closestColors.slice(1) : [],
                    isExternal: !hasColor
                };
            }
        }
        
        this.isGenerated = true;
        // 保存原始颜色网格，供颜色合并时作为基线
        this.baseColorGrid = this.cloneColorGrid(this.colorGrid);
        if (this.editGuard) this.editGuard.style.display = 'none';
        
        // 隐藏框选网格的选框，但保持 isSelectingGrid 状态以便逻辑继续有效
        if (this.selectionBox) {
            this.selectionBox.style.display = 'none';
        }

        this.saveState();

        // 切换到对比模式（显示图纸）
        this.isCompareMode = true;
        const updateCompareBtn = (btn) => {
            if (btn) {
                btn.classList.add('active');
                const span = btn.querySelector('span');
                if (span) span.textContent = '显示原图';
            }
        };
        updateCompareBtn(this.toggleCompareBtn);
        updateCompareBtn(this.toggleCompareBtnSidebar);

        this.redrawCanvas();
        if (this.toolsSection) this.toolsSection.classList.remove('tool-locked');
        this.updateCursor();

        // 分析完成后自动适配视图
        this.fitImageToView();
    }

    getCellColor(imageData, x, y, w, h, canvasWidth, canvasHeight) {
        const colors = [];
        let transparentCount = 0;
        const alphaThreshold = 10; // Skip pixels that are effectively transparent
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(canvasWidth, Math.ceil(x + w));
        const endY = Math.min(canvasHeight, Math.ceil(y + h));
        
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const i = (py * canvasWidth + px) * 4;
                const a = imageData.data[i + 3];
                if (a <= alphaThreshold) {
                    transparentCount++;
                    continue;
                }
                colors.push({
                    r: imageData.data[i],
                    g: imageData.data[i + 1],
                    b: imageData.data[i + 2]
                });
            }
        }
        
        if (colors.length === 0) return null;
        
        // 根据颜色识别方式计算
        switch (this.colorMethod) {
            case 'average':
                return this.getAverageColor(colors);
            case 'dominant':
                // 如果透明的色块大于所有有颜色的色块，则为透明
                if (transparentCount > colors.length) return null;
                return this.getDominantColor(colors);
            default:
                return this.getAverageColor(colors);
        }
    }

    getAverageColor(colors) {
        const sum = colors.reduce((acc, c) => ({
            r: acc.r + c.r,
            g: acc.g + c.g,
            b: acc.b + c.b
        }), { r: 0, g: 0, b: 0 });
        
        return {
            r: Math.round(sum.r / colors.length),
            g: Math.round(sum.g / colors.length),
            b: Math.round(sum.b / colors.length)
        };
    }

    getDominantColor(colors) {
        if (!colors.length) return { r: 0, g: 0, b: 0 };
        const colorCounts = new Map();
        let maxCount = 0;
        let dominant = colors[0];

        colors.forEach(c => {
            const key = `${c.r},${c.g},${c.b}`;
            const count = (colorCounts.get(key) || 0) + 1;
            colorCounts.set(key, count);
            if (count > maxCount) {
                maxCount = count;
                dominant = c;
            }
        });
        return dominant;
    }

    identifyColorAt(x, y) {
        if (!this.uploadedImage) return;
        
        let r, g, b;
        
        // Determine color based on current state
        if (this.isGenerated && this.colorGrid && this.colorGrid.length > 0) {
            // Map x,y to grid cell
            const { offsetX = 0, offsetY = 0, cellWidth, cellHeight } = this.gridData;
            // Calculate col/row
            const col = Math.floor((x - offsetX) / cellWidth);
            const row = Math.floor((y - offsetY) / cellHeight);
            
            if (row >= 0 && row < this.colorGrid.length && col >= 0 && col < this.colorGrid[0].length) {
                const cell = this.colorGrid[row][col];
                if (cell && cell.color) {
                    ({ r, g, b } = cell.color.rgb);
                } else {
                    return; // Empty/Transparent
                }
            } else {
                return; // Outside grid
            }
        } else {
            // Raw image mode
            // Ensure x,y are within canvas bounds
            if (x < 0 || x >= this.mainCanvas.width || y < 0 || y >= this.mainCanvas.height) return;
            
            try {
                // Get pixel from canvas
                const pixel = this.ctx.getImageData(x, y, 1, 1).data;
                if (pixel[3] === 0) return; // Transparent
                r = pixel[0];
                g = pixel[1];
                b = pixel[2];
            } catch (e) {
                return;
            }
        }
        
        if (r === undefined) return;
        
        const targetColor = { r, g, b };
        this.updateIdentifyUI(targetColor);
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    updateIdentifyUI(targetColor) {
        // Show picked color
        const swatch = document.getElementById('pickedColorSwatch');
        const info = document.getElementById('pickedColorInfo');
        const hex = this.rgbToHex(targetColor.r, targetColor.g, targetColor.b);
        
        if (swatch) swatch.style.backgroundColor = hex;
        if (info) {
             info.innerHTML = `
                <span style="font-weight: 600;">${hex}</span>
                <span>R:${targetColor.r} G:${targetColor.g} B:${targetColor.b}</span>
             `;
        }
        
        // Find similar colors
        const allColors = window.getAllColors();
        let candidateColors = [];
        const selectedIds = window.getSelectedColorIds();
        if (selectedIds && selectedIds.size > 0) {
             candidateColors = allColors.filter(c => selectedIds.has(c.id));
        } else {
            candidateColors = allColors; 
        }

        const withDistance = candidateColors.map(c => {
            const dist = this.colorDistance(targetColor, c.rgb);
            // Max distance in RGB is sqrt(255^2 * 3) ≈ 441.67
            const similarity = Math.max(0, 100 * (1 - dist / 442)).toFixed(1);
            return { ...c, dist, similarity };
        });
        
        withDistance.sort((a, b) => a.dist - b.dist);
        const top10 = withDistance.slice(0, 10);
        
        // Render list
        const list = document.getElementById('similarColorsList');
        if (list) {
            if (top10.length === 0) {
                list.innerHTML = '<div class="empty-state"><p>没有找到匹配的颜色</p></div>';
            } else {
                list.innerHTML = top10.map(c => {
                    const displayId = window.getDisplayId ? window.getDisplayId(c, this.colorSystem) : c.id;
                    return `
                    <div class="similar-color-item">
                        <div class="similar-color-swatch" style="background-color: ${c.hex}"></div>
                        <div class="similar-color-info">
                            <span class="similar-color-code">${displayId}</span>
                        </div>
                        <div class="similarity-score">${c.similarity}%</div>
                    </div>
                `}).join('');
            }
        }
    }

    // 移除 getMedianColor 方法，因为不再需要
    /*
    getMedianColor(colors) {
        const sortedR = colors.map(c => c.r).sort((a, b) => a - b);
        const sortedG = colors.map(c => c.g).sort((a, b) => a - b);
        const sortedB = colors.map(c => c.b).sort((a, b) => a - b);
        const mid = Math.floor(colors.length / 2);
        
        return {
            r: sortedR[mid],
            g: sortedG[mid],
            b: sortedB[mid]
        };
    }
    */

    // 调色板管理
    updateUsedColorsPalette() {
        if (!this.colorGrid.length) {
            this.paletteUsed.innerHTML = '<div class="empty-state"><p>暂无使用的颜色</p></div>';
            this.updateCurrentColorDisplay();
            return;
        }
        
        const usedColors = new Map();
        this.colorGrid.forEach(row => {
            row.forEach(cell => {
                if (cell && cell.color) {
                    usedColors.set(cell.color.id, cell.color);
                }
            });
        });
        
        if (usedColors.size === 0) {
            this.paletteUsed.innerHTML = '<div class="empty-state"><p>暂无使用的颜色</p></div>';
            this.updateCurrentColorDisplay();
            return;
        }

        // 对使用的颜色进行排序
        const sortedUsedColors = Array.from(usedColors.values()).sort((a, b) => {
            const idA = window.getDisplayId(a, this.colorSystem);
            const idB = window.getDisplayId(b, this.colorSystem);
            
            // 尝试提取数字部分进行比较
            const numA = parseInt(idA.replace(/\D/g, '')) || 0;
            const numB = parseInt(idB.replace(/\D/g, '')) || 0;
            
            if (numA !== numB) return numA - numB;
            return idA.localeCompare(idB);
        });
        
        let html = '<div class="all-colors-grid">';
        sortedUsedColors.forEach(color => {
            const displayId = window.getDisplayId(color, this.colorSystem);
            const isSelected = this.selectedColor && this.selectedColor.id === color.id;
            html += `
                <div class="color-swatch ${isSelected ? 'selected' : ''}" 
                     style="background-color: ${color.hex}"
                     data-color-id="${color.id}"
                     title="${displayId}">
                    <span class="swatch-id">${displayId}</span>
                </div>
            `;
        });
        html += '</div>';
        
        this.paletteUsed.innerHTML = html;
        
        // 添加点击事件
        this.paletteUsed.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const colorId = swatch.dataset.colorId;
                const color = Array.from(usedColors.values()).find(c => c.id === colorId);
                if (color) {
                    this.selectedColor = color;
                    this.selectColorInPalette(color);
                }
            });
        });

        this.updateCurrentColorDisplay();
    }

    initAllColorsPalette() {
        const allColors = window.getAllColors();
        const selectedIds = window.getSelectedColorIds();
        const system = this.colorSystem;

        // 1. 过滤：只显示用户在“选择颜色”中勾选的颜色
        // 如果没有选择任何颜色（初始状态可能为空），显示所有或者根据逻辑决定
        // 按照逻辑 findClosestColors，如果为空是显示所有。但这里为了“同步”，应该为空就显示空或提示去选择。
        // 为了用户体验，如果 selectedIds 为空，我们假设全选了（或者提示去选择）。
        // 实际上 loadSelectedColors 会在为空时默认全选。所以这里 selectedIds 应该不为空。
        
        let displayColors = allColors.filter(c => selectedIds.has(c.id));
        
        // 如果过滤后为空（异常情况），显示所有
        if (displayColors.length === 0) {
            displayColors = allColors;
        }

        // 2. 排序：按字母分组，同一首字母在一起，然后按数字排序
        const sortedAllColors = displayColors.sort((a, b) => {
            const idA = window.getDisplayId(a, system);
            const idB = window.getDisplayId(b, system);
            
            // 提取字母部分作为分组依据
            const groupA = idA.replace(/[^A-Za-z\u4e00-\u9fa5]/g, ''); // 保留字母和汉字
            const groupB = idB.replace(/[^A-Za-z\u4e00-\u9fa5]/g, '');
            
            if (groupA !== groupB) {
                return groupA.localeCompare(groupB);
            }
            
            // 同组内按数字排序
            const numA = parseInt(idA.replace(/\D/g, '')) || 0;
            const numB = parseInt(idB.replace(/\D/g, '')) || 0;
            
            if (numA !== numB) return numA - numB;
            return idA.localeCompare(idB);
        });
        
        let html = '';
        // 3. 渲染：为了体现“分组”，我们在网格中直接排列，但由于已排序，同组颜色会自然聚集
        // 如果需要显式分组标题，会破坏 grid 布局。这里先只做排序。
        
        sortedAllColors.forEach(color => {
            const displayId = window.getDisplayId(color, system);
            if (!displayId) return;
            
            // 检查是否被选中（当前画笔颜色）
            const isSelected = this.selectedColor && this.selectedColor.id === color.id;
            
            html += `
                <div class="color-swatch ${isSelected ? 'selected' : ''}" 
                     style="background-color: ${color.hex}"
                     data-color-id="${color.id}"
                     title="${displayId}">
                    <span class="swatch-id">${displayId}</span>
                </div>
            `;
        });
        
        if (sortedAllColors.length === 0) {
            html = '<div class="empty-state"><p>未选择任何颜色</p></div>';
        }
        
        this.allColorsGrid.innerHTML = html;
        
        // 添加点击事件
        this.allColorsGrid.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const colorId = swatch.dataset.colorId;
                const color = allColors.find(c => c.id === colorId);
                if (color) {
                    this.selectedColor = color;
                    this.selectColorInPalette(color);
                }
            });
        });
    }

    selectColorInPalette(color) {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        document.querySelectorAll(`[data-color-id="${color.id}"]`).forEach(s => s.classList.add('selected'));
        this.updateCurrentColorDisplay();
    }

    hexToRgb(hex) {
        const parsed = hex.replace('#', '');
        const bigint = parseInt(parsed, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    colorDistance(c1, c2) {
        const dr = c1.r - c2.r;
        const dg = c1.g - c2.g;
        const db = c1.b - c2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    mergeSimilarColors() {
        if (!this.colorGrid.length) return;
        // 每次合并前回到分析时的原始颜色基线
        if (this.baseColorGrid) {
            this.colorGrid = this.cloneColorGrid(this.baseColorGrid);
        }
        const rows = this.colorGrid.length;
        const cols = this.colorGrid[0].length;
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const allColors = window.getAllColors();
        const colorMap = new Map(allColors.map(c => [c.id, c]));
        const threshold = this.mergeThreshold || 0;

        const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (visited[r][c]) continue;
                const startCell = this.colorGrid[r][c];
                if (!startCell || !startCell.color) {
                    visited[r][c] = true;
                    continue;
                }

                const startRgb = this.hexToRgb(startCell.color.hex);
                const queue = [[r, c]];
                const region = [];
                const count = new Map();

                while (queue.length) {
                    const [cr, cc] = queue.shift(); // BFS use shift, DFS use pop
                    if (visited[cr][cc]) continue;
                    visited[cr][cc] = true;

                    const cell = this.colorGrid[cr][cc];
                    if (!cell || !cell.color) continue;

                    const cellRgb = this.hexToRgb(cell.color.hex);
                    if (this.colorDistance(startRgb, cellRgb) > threshold) continue;

                    region.push([cr, cc]);
                    count.set(cell.color.id, (count.get(cell.color.id) || 0) + 1);

                    for (const [dr, dc] of directions) {
                        const nr = cr + dr;
                        const nc = cc + dc;
                        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                        if (visited[nr][nc]) continue;
                        const neighbor = this.colorGrid[nr][nc];
                        if (!neighbor || !neighbor.color) continue;
                        const nRgb = this.hexToRgb(neighbor.color.hex);
                        if (this.colorDistance(startRgb, nRgb) <= threshold) {
                            queue.push([nr, nc]);
                        }
                    }
                }

                if (!region.length) continue;
                let bestId = null;
                let bestCount = -1;
                count.forEach((cnt, id) => {
                    if (cnt > bestCount) {
                        bestCount = cnt;
                        bestId = id;
                    }
                });

                const bestColor = bestId ? colorMap.get(bestId) : null;
                if (!bestColor) continue;

                region.forEach(([rr, cc]) => {
                    this.colorGrid[rr][cc].color = bestColor;
                });
            }
        }

        this.redrawCanvas();
        this.saveState();
    }

    updateCurrentColorDisplay() {
        const displayEl = document.getElementById('currentColorDisplay');
        if (!displayEl) return;
        const swatch = displayEl.querySelector('.color-swatch');
        const codeEl = displayEl.querySelector('.color-code');
        if (!swatch || !codeEl) return;

        if (this.selectedColor) {
            const displayId = window.getDisplayId(this.selectedColor, this.colorSystem) || this.selectedColor.id;
            swatch.style.background = this.selectedColor.hex;
            swatch.style.borderColor = this.selectedColor.hex;
            codeEl.textContent = displayId;
            displayEl.classList.remove('empty');
        } else {
            swatch.style.background = 'transparent';
            swatch.style.borderColor = 'var(--border-color)';
            codeEl.textContent = '未选择';
            displayEl.classList.add('empty');
        }
    }

    updateColorStats() {
        if (!this.colorGrid.length) {
            this.colorStats.innerHTML = '<div class="empty-state"><p>暂无统计数据</p></div>';
            document.getElementById('colorCountInfo').textContent = '0';
            return;
        }
        
        const colorCount = new Map();
        let total = 0;
        
        this.colorGrid.forEach(row => {
            row.forEach(cell => {
                if (cell && cell.color) {
                    const id = cell.color.id;
                    colorCount.set(id, (colorCount.get(id) || 0) + 1);
                    total++;
                }
            });
        });
        
        document.getElementById('colorCountInfo').textContent = colorCount.size;
        
        if (colorCount.size === 0) {
            this.colorStats.innerHTML = '<div class="empty-state"><p>暂无统计数据</p></div>';
            return;
        }
        
        const sortedColors = Array.from(colorCount.entries()).sort((a, b) => {
            // 先按数量降序
            if (b[1] !== a[1]) return b[1] - a[1];
            
            // 数量相同时，按 ID 排序
            const allColors = window.getAllColors();
            const colorA = allColors.find(c => c.id === a[0]);
            const colorB = allColors.find(c => c.id === b[0]);
            if (!colorA || !colorB) return 0;
            
            const idA = window.getDisplayId(colorA, this.colorSystem);
            const idB = window.getDisplayId(colorB, this.colorSystem);
            
            // 尝试提取数字部分进行比较
            const numA = parseInt(idA.replace(/\D/g, '')) || 0;
            const numB = parseInt(idB.replace(/\D/g, '')) || 0;
            
            if (numA !== numB) return numA - numB;
            return idA.localeCompare(idB);
        });
        
        let html = '';
        sortedColors.forEach(([id, count]) => {
            const allColors = window.getAllColors();
            const color = allColors.find(c => c.id === id);
            if (!color) return;
            
            const displayId = window.getDisplayId(color, this.colorSystem);
            const percentage = ((count / total) * 100).toFixed(1);
            
            html += `
                <div class="stat-item">
                    <div class="stat-color" style="background-color: ${color.hex}"></div>
                    <div class="stat-info">
                        <span class="stat-id">${displayId}</span>
                        <span class="stat-count">${count} (${percentage}%)</span>
                    </div>
                </div>
            `;
        });
        
        this.colorStats.innerHTML = html;
    }

    // 历史记录
    saveState() {
        const state = JSON.parse(JSON.stringify(this.colorGrid));
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex++;
        
        document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
        document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.colorGrid = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.redrawCanvas();
            document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
            document.getElementById('redoBtn').disabled = false;
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.colorGrid = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.redrawCanvas();
            document.getElementById('undoBtn').disabled = false;
            document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    clearCanvas() {
        if (!confirm('确定要清空画布吗？')) return;
        
        this.colorGrid.forEach(row => {
            row.forEach(cell => {
                cell.color = null;
            });
        });
        this.baseColorGrid = this.cloneColorGrid(this.colorGrid);
        
        this.saveState();
        this.redrawCanvas();
    }

    // 导出
    showExportModal() {
        if (this.exportModal) this.exportModal.style.display = 'flex';
    }

    hideExportModal() {
        if (this.exportModal) this.exportModal.style.display = 'none';
    }

    handleExport(mode) {
        if (!this.colorGrid.length) {
            alert('请先创建或编辑图案');
            return;
        }

        const showGrid = this.exportShowGrid ? this.exportShowGrid.checked : true;
        const gridColor = this.exportGridColor ? this.exportGridColor.value || '#999999' : '#999999';
        const gridInterval = this.exportGridInterval ? Math.max(1, parseInt(this.exportGridInterval.value, 10) || 1) : 1;
        const showCoords = this.exportShowCoords ? this.exportShowCoords.checked : false;
        const coordInterval = this.exportCoordInterval ? Math.max(1, parseInt(this.exportCoordInterval.value, 10) || 1) : 1;
        const hideCodes = this.exportHideCodes ? this.exportHideCodes.checked : false;
        const includeStats = this.exportIncludeStats ? this.exportIncludeStats.checked : false;

        const result = this.renderExportImage({ showGrid, gridColor, gridInterval, showCoords, coordInterval, hideCodes, includeStats });
        if (!result) return;

        if (mode === 'copy') {
            this.copyCanvasToClipboard(result.canvas);
        } else {
            this.downloadCanvas(result.canvas, result.filename);
        }
    }

    renderExportImage(options) {
        const { showGrid, gridColor, gridInterval = 1, showCoords, coordInterval = 1, hideCodes, includeStats } = options;
        const cols = this.colorGrid[0].length;
        const rows = this.colorGrid.length;

        const cellSize = this.calculateExportCellSize(cols, rows);
        const sizeScale = cellSize / 40;
        const padding = Math.max(20, Math.round(32 * sizeScale));

        const statsData = includeStats ? this.collectColorStats() : [];
        const canvasWidth = cols * cellSize + padding * 2;
        const statsLayout = includeStats ? this.computeStatsLayout(statsData, canvasWidth - padding * 2, sizeScale) : { height: 0, items: [] };
        const canvasHeight = rows * cellSize + padding * 2 + statsLayout.height;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvasWidth;
        exportCanvas.height = canvasHeight;
        const ctx = exportCanvas.getContext('2d');

        // 背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 颜色格子
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = this.colorGrid[row][col];
                const x = padding + col * cellSize;
                const y = padding + row * cellSize;

                ctx.fillStyle = cell && cell.color ? cell.color.hex : '#ffffff';
                ctx.fillRect(x, y, cellSize, cellSize);

                if (cell && cell.color && !hideCodes) {
                    const displayId = window.getDisplayId(cell.color, this.colorSystem);
                    if (displayId) {
                        ctx.fillStyle = '#000000';
                        // 加粗，并计算最大可能的字体大小 (cellHeight 的 0.6 倍，留出边距)
                        const fontSize = Math.max(10, cellSize * 0.6);
                        ctx.font = `bold ${fontSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        // 确保文字宽度不超过格子宽度
                        const metrics = ctx.measureText(displayId);
                        const maxTextWidth = cellSize * 0.9; // 留出左右边距
                        
                        if (metrics.width > maxTextWidth) {
                            // 如果文字太宽，缩小字体
                            const scale = maxTextWidth / metrics.width;
                            ctx.font = `bold ${fontSize * scale}px Arial`;
                        }
                        
                        // 描边以增加对比度 (白色描边)
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = Math.max(2, fontSize * 0.08); // 描边宽度随字体大小动态调整
                        ctx.strokeText(displayId, x + cellSize / 2, y + cellSize / 2);
                        
                        ctx.fillText(displayId, x + cellSize / 2, y + cellSize / 2);
                    }
                }
            }
        }

        // 网格线（按间隔）
        if (showGrid) {
            ctx.strokeStyle = gridColor || '#999999';
            ctx.lineWidth = 1;
            for (let c = 0; c <= cols; c += gridInterval) {
                const x = padding + c * cellSize;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + rows * cellSize);
                ctx.stroke();
            }
            if (cols % gridInterval !== 0) {
                const x = padding + cols * cellSize;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + rows * cellSize);
                ctx.stroke();
            }
            for (let r = 0; r <= rows; r += gridInterval) {
                const y = padding + r * cellSize;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + cols * cellSize, y);
                ctx.stroke();
            }
            if (rows % gridInterval !== 0) {
                const y = padding + rows * cellSize;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + cols * cellSize, y);
                ctx.stroke();
            }
        }

        // 坐标数字
        if (showCoords) {
            const coordFontSize = Math.max(10, Math.round(12 * sizeScale));
            const coordOffset = Math.max(12, Math.round(18 * sizeScale));
            ctx.fillStyle = '#000000';
            ctx.font = `${coordFontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // X轴坐标 (顶部和底部)
            for (let c = 0; c < cols; c += coordInterval) {
                const x = padding + c * cellSize + cellSize / 2;
                const num = c + 1;
                ctx.fillText(num, x, padding - coordOffset); // 顶部
                ctx.fillText(num, x, padding + rows * cellSize + coordOffset); // 底部
            }
            const lastCol = cols - 1;
            if ((lastCol + 1) % coordInterval !== 0) {
                const x = padding + lastCol * cellSize + cellSize / 2;
                const num = cols;
                ctx.fillText(num, x, padding - coordOffset); // 顶部
                ctx.fillText(num, x, padding + rows * cellSize + coordOffset); // 底部
            }

            // Y轴坐标 (左侧和右侧)
            for (let r = 0; r < rows; r += coordInterval) {
                const y = padding + r * cellSize + cellSize / 2;
                const num = r + 1;
                ctx.fillText(num, padding - coordOffset, y); // 左侧
                ctx.fillText(num, padding + cols * cellSize + coordOffset, y); // 右侧
            }
            const lastRow = rows - 1;
            if ((lastRow + 1) % coordInterval !== 0) {
                const y = padding + lastRow * cellSize + cellSize / 2;
                const num = rows;
                ctx.fillText(num, padding - coordOffset, y); // 左侧
                ctx.fillText(num, padding + cols * cellSize + coordOffset, y); // 右侧
            }
        }

        // 统计信息
        if (includeStats) {
            const statsY = padding * 2 + rows * cellSize;
            this.drawStats(ctx, statsLayout, padding, statsY, canvasWidth - padding * 2, sizeScale);
        }

        return {
            canvas: exportCanvas,
            filename: `拼豆图纸_${Date.now()}.png`
        };
    }

    drawStats(ctx, layout, x, y, width, scale) {
        const { items, cardW, cardH, gap, perRow, titleHeight } = layout;

        // 标题
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.max(14, Math.round(18 * scale))}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('颜色统计', x, y);

        const startY = y + titleHeight;

        items.forEach((item, idx) => {
            const row = Math.floor(idx / perRow);
            const col = idx % perRow;
            const cardX = x + col * (cardW + gap);
            const cardY = startY + row * (cardH + gap);

            const rgb = this.hexToRgb(item.color.hex);
            const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
            const stroke = item.color.hex;

            this.drawRoundedRect(ctx, cardX, cardY, cardW, cardH, Math.round(10 * scale), bg, stroke);

            // 色块 - 增大统计颜色块
            const swatchSize = Math.max(32, Math.round(48 * scale));
            const swatchX = cardX + Math.max(10, Math.round(12 * scale));
            const swatchY = cardY + Math.max(10, Math.round(12 * scale));
            ctx.fillStyle = item.color.hex;
            ctx.fillRect(swatchX, swatchY, swatchSize, swatchSize);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(swatchX, swatchY, swatchSize, swatchSize);

            // 文本
            const textX = swatchX + swatchSize + Math.max(10, Math.round(12 * scale));
            const nameFont = `${Math.max(14, Math.round(16 * scale))}px Arial`;
            const subFont = `${Math.max(12, Math.round(13 * scale))}px Arial`;
            ctx.fillStyle = '#000000';
            ctx.font = nameFont;
            ctx.textBaseline = 'top';
            ctx.fillText(item.displayId, textX, swatchY);
            ctx.font = subFont;
            ctx.fillStyle = '#333333';
            ctx.fillText(`${item.count} (${item.percent}%)`, textX, swatchY + Math.max(20, Math.round(22 * scale)));
        });
    }

    drawRoundedRect(ctx, x, y, w, h, r, fill, stroke) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    collectColorStats() {
        const colorCount = new Map();
        let total = 0;
        this.colorGrid.forEach(row => {
            row.forEach(cell => {
                if (cell && cell.color) {
                    const id = cell.color.id;
                    colorCount.set(id, (colorCount.get(id) || 0) + 1);
                    total++;
                }
            });
        });

        const allColors = window.getAllColors();
        const stats = Array.from(colorCount.entries()).map(([id, count]) => {
            const color = allColors.find(c => c.id === id);
            if (!color) return null;
            const displayId = window.getDisplayId(color, this.colorSystem) || id;
            const percent = total ? ((count / total) * 100).toFixed(1) : '0.0';
            return { id, count, percent, color, displayId };
        }).filter(Boolean).sort((a, b) => b.count - a.count);

        return stats;
    }

    computeStatsLayout(stats, areaWidth, scale) {
        const items = stats.slice(0, 12);
        const cardW = Math.max(120, Math.min(220, Math.round(170 * scale)));
        const cardH = Math.max(70, Math.min(130, Math.round(96 * scale)));
        const gap = Math.max(10, Math.round(14 * scale));
        const perRow = Math.max(1, Math.floor((areaWidth + gap) / (cardW + gap)));
        const rows = Math.max(1, Math.ceil(items.length / perRow));
        const titleHeight = Math.max(26, Math.round(28 * scale));
        const height = titleHeight + rows * cardH + (rows - 1) * gap;
        return { height, items, cardW, cardH, gap, perRow, titleHeight };
    }

    calculateExportCellSize(cols, rows) {
        const maxEdge = 2400;
        const largest = Math.max(cols, rows);
        const ideal = Math.floor(maxEdge / largest);
        return Math.max(18, Math.min(60, ideal));
    }

    copyCanvasToClipboard(canvas) {
        if (!navigator.clipboard || !canvas) {
            alert('当前浏览器不支持复制图片到剪贴板');
            return;
        }

        canvas.toBlob((blob) => {
            if (!blob) return;
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                alert('已复制到剪贴板');
                this.hideExportModal();
            }).catch(() => {
                alert('复制失败，请检查权限');
            });
        });
    }

    downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename || `拼豆图纸_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.hideExportModal();
    }

    // 模态框管理
    showColorSelectModal() {
        this.renderColorSelectList();
        this.colorSelectModal.style.display = 'flex';
    }

    hideColorSelectModal() {
        this.colorSelectModal.style.display = 'none';
    }

    renderColorSelectList() {
        const allColors = window.getAllColors();
        const selectedIds = window.getSelectedColorIds();
        const system = this.colorSystem;
        
        const groups = new Map();
        allColors.forEach(color => {
            const group = window.getGroupBySystem(color, system);
            const displayId = window.getDisplayId(color, system);
            if (!displayId) return;
            
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.get(group).push(color);
        });
        
        let html = '';
        groups.forEach((colors, group) => {
            const groupSelected = colors.filter(c => selectedIds.has(c.id)).length;
            html += `<div class="color-group" data-group="${group}">`;
            html += `  <div class="group-header">`;
            html += `    <button class="group-toggle" data-group="${group}">► ${group} 系列</button>`;
            html += `    <div class="group-meta">
                            <span class="group-count">${groupSelected}/${colors.length}</span>
                            <div class="group-actions">
                                <button class="btn-tertiary group-select" data-group="${group}" data-action="select">本组全选</button>
                                <button class="btn-tertiary group-select" data-group="${group}" data-action="clear">本组全不选</button>
                            </div>
                        </div>`;
            html += `  </div>`;
            html += `  <div class="group-body collapsed" data-group-body="${group}">`;
            html += `    <div class="color-grid">`;
            
            colors.forEach(color => {
                const isSelected = selectedIds.has(color.id);
                const displayId = window.getDisplayId(color, system);
                
                html += `
                    <div class="color-checkbox-item">
                        <input type="checkbox" 
                               id="color-${color.id}" 
                               value="${color.id}" 
                               ${isSelected ? 'checked' : ''}>
                        <label for="color-${color.id}">
                            <div class="color-sample" style="background-color: ${color.hex}"></div>
                            <span class="color-id">${displayId}</span>
                        </label>
                    </div>
                `;
            });
            
            html += `    </div>`;
            html += `  </div>`;
            html += `</div>`;
        });
        
        this.colorSelectList.innerHTML = html;

        // 折叠展开控制
        this.colorSelectList.querySelectorAll('.group-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const group = toggle.dataset.group;
                const body = this.colorSelectList.querySelector(`[data-group-body="${group}"]`);
                const isCollapsed = body.classList.toggle('collapsed');
                toggle.textContent = `${isCollapsed ? '►' : '▼'} ${group} 系列`;
            });
        });

        // 分组全选/全不选
        this.colorSelectList.querySelectorAll('.group-select').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.dataset.group;
                const action = btn.dataset.action;
                const body = this.colorSelectList.querySelector(`[data-group-body="${group}"]`);
                if (!body) return;
                body.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = action === 'select';
                });
                this.updateSelectionSummary();
            });
        });

        // 逐项监听以更新计数
        this.colorSelectList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => this.updateSelectionSummary());
        });

        this.updateSelectionSummary();
    }

    updateSelectionSummary() {
        if (!this.colorSelectList) return;

        const checkboxes = Array.from(this.colorSelectList.querySelectorAll('input[type="checkbox"]'));
        const total = checkboxes.length;
        const selected = checkboxes.filter(cb => cb.checked).length;

        if (this.colorCountSummary) {
            this.colorCountSummary.textContent = `已选 ${selected} / 总计 ${total}`;
        }

        this.colorSelectList.querySelectorAll('.color-group').forEach(groupEl => {
            const groupCheckboxes = Array.from(groupEl.querySelectorAll('input[type="checkbox"]'));
            const countEl = groupEl.querySelector('.group-count');
            if (countEl) {
                countEl.textContent = `${groupCheckboxes.filter(cb => cb.checked).length}/${groupCheckboxes.length}`;
            }
        });
    }

    selectAllColors(select) {
        this.colorSelectList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = select;
        });
        this.updateSelectionSummary();
    }

    saveColorSelection() {
        const checkboxes = this.colorSelectList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedIds = new Set();
        checkboxes.forEach(cb => selectedIds.add(cb.value));
        
        window.saveSelectedColorIds(selectedIds);
        this.hideColorSelectModal();
        this.initAllColorsPalette();
        this.updateUsedColorsPalette();

        // 如果已经生成过图纸，重新分析颜色
        if (this.isGenerated) {
            this.analyzeColors();
        }
    }

    loadSelectedColors() {
        const selectedIds = window.getSelectedColorIds();
        if (selectedIds.size === 0) {
            const allColors = window.getAllColors();
            const allIds = new Set(allColors.map(c => c.id));
            window.saveSelectedColorIds(allIds);
        }
    }

    // 框选网格功能
    startGridSelection() {
        if (!this.uploadedImage) {
            this.showToast('请先上传图片', 'error');
            return;
        }
        this.closeMobileMenus();
        // 若已在选择状态，先结束，避免重复绑定
        if (this.isSelectingGrid) {
            this.endGridSelection();
        }
        this.isSelectingGrid = true;
        
        // 保持上次的选框状态，如果没有有效的选框则使用默认值（图片1/3大小，居中）
        this.ensureNineGridState();
        
        if (this.selectGridBtn) this.selectGridBtn.classList.add('active');
        this.canvasScroll.classList.add('selecting-mode');
        this.mainCanvas.style.cursor = 'crosshair';
        this.gridLinesBeforeSelect = this.showGridLines;
        this.showGridLines = false;
        this.redrawCanvas();

        this.renderNineGridOverlay();
    }

    endGridSelection() {
        this.isSelectingGrid = false;
        this.selectionStart = null;
        this.canvasScroll.classList.remove('selecting-mode');
        this.mainCanvas.style.cursor = 'crosshair';
        if (this.selectionBox) this.selectionBox.style.display = 'none';
        if (this.selectGridBtn) this.selectGridBtn.classList.remove('active');
        this.showGridLines = this.gridLinesBeforeSelect;
        this.redrawCanvas();

        this.nineGridDrag = null;
        // 恢复普通工具光标
        this.updateCursor();
    }

    // 将屏幕坐标转换为 canvas 内部坐标
    screenToCanvasCoords(clientX, clientY) {
        const canvasRect = this.mainCanvas.getBoundingClientRect();
        
        // 获取 canvas 的 border 宽度
        const style = getComputedStyle(this.mainCanvas);
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderTop = parseFloat(style.borderTopWidth) || 0;
        const borderRight = parseFloat(style.borderRightWidth) || 0;
        const borderBottom = parseFloat(style.borderBottomWidth) || 0;
        
        // 内容区域的显示尺寸（排除 border）
        const contentWidth = canvasRect.width - borderLeft - borderRight;
        const contentHeight = canvasRect.height - borderTop - borderBottom;
        
        // 屏幕坐标相对于 canvas 内容区域（排除 border）
        const screenX = clientX - canvasRect.left - borderLeft;
        const screenY = clientY - canvasRect.top - borderTop;
        
        // 转换为 canvas 实际坐标
        const canvasX = (screenX / contentWidth) * this.mainCanvas.width;
        const canvasY = (screenY / contentHeight) * this.mainCanvas.height;
        
        return { screenX, screenY, canvasX, canvasY, canvasRect, contentWidth, contentHeight, borderLeft, borderTop };
    }

    // 获取 canvas 相对于 scroll 容器的可见偏移与缩放，用于放置选框
    getCanvasDisplayMetrics() {
        const canvasRect = this.mainCanvas.getBoundingClientRect();
        const scrollRect = this.canvasScroll.getBoundingClientRect();
        
        // 获取 border 宽度
        const style = getComputedStyle(this.mainCanvas);
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderTop = parseFloat(style.borderTopWidth) || 0;
        const borderRight = parseFloat(style.borderRightWidth) || 0;
        const borderBottom = parseFloat(style.borderBottomWidth) || 0;
        
        // 内容区域的显示尺寸
        const contentWidth = canvasRect.width - borderLeft - borderRight;
        const contentHeight = canvasRect.height - borderTop - borderBottom;
        
        const scaleX = contentWidth / this.mainCanvas.width;
        const scaleY = contentHeight / this.mainCanvas.height;
        
        // 内容区域左上角相对于 scroll 容器的偏移
        const offsetX = canvasRect.left + borderLeft - scrollRect.left + this.canvasScroll.scrollLeft;
        const offsetY = canvasRect.top + borderTop - scrollRect.top + this.canvasScroll.scrollTop;
        
        return { scaleX, scaleY, offsetX, offsetY };
    }

    // 移动端交互适配
    initMobileInteractions() {
        const leftPanel = document.querySelector('.left-panel');
        const toggleLeft = document.getElementById('toggleLeftPanel');
        
        // 创建遮罩层
        let overlay = document.querySelector('.panel-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'panel-overlay';
            document.body.appendChild(overlay);
        }
        
        const togglePanel = (panel, show) => {
            panel.classList.toggle('show', show);
            
            // 更新按钮状态
            if (panel === leftPanel && toggleLeft) {
                toggleLeft.classList.toggle('active', show);
            }

            const anyVisible = leftPanel.classList.contains('show');
            overlay.classList.toggle('show', anyVisible);
        };
        
        if (toggleLeft) {
            toggleLeft.addEventListener('click', (e) => {
                e.stopPropagation();
                // 强制移除 show 类以确保切换状态正常，不依赖上传图片
                togglePanel(leftPanel, !leftPanel.classList.contains('show'));
            });
            // 确保按钮初始状态可用
            toggleLeft.disabled = false;
        }
        
        // 点击遮罩层关闭面板
        overlay.addEventListener('click', () => {
            togglePanel(leftPanel, false);
        });
        
        // 监听屏幕方向变化，调整布局
        window.addEventListener('resize', () => {
            // 防止虚拟键盘弹出导致误触调整，可以增加 debounce
            if (window.innerWidth > 768) {
                this.closeMobileMenus();
            }
            // 窗口大小变化时更新游离式网格覆盖层
            this.updateGridOverlay();
        });
    }

    closeMobileMenus() {
        const leftPanel = document.querySelector('.left-panel');
        const overlay = document.querySelector('.panel-overlay');
        const toggleLeft = document.getElementById('toggleLeftPanel');

        if (leftPanel) leftPanel.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        if (toggleLeft) toggleLeft.classList.remove('active');
    }

    // 消息提示
    showToast(message, type = 'info') {
        if (!this.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        if (type === 'success') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        else if (type === 'error') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        else icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        
        toast.innerHTML = `${icon}<span>${message}</span>`;
        
        this.toastContainer.appendChild(toast);
        
        // 强制重绘以触发过渡
        toast.offsetHeight;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    onSelectionMouseDown() {}
    onSelectionMouseMove() {}
    onSelectionMouseUp() {}
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new PerlerBeadApp();
    app.initMobileInteractions();
});
