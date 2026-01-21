// 现代化拼豆图纸生成器 - 主应用程序

class PerlerBeadApp {
    constructor() {
        this.uploadedImage = null;
        this.gridData = null;
        this.colorGrid = [];
        this.selectedTool = 'brush';
        this.selectedColor = null;
        this.colorSystem = 'MARD';
        this.colorMethod = 'average';
        this.zoomLevel = 1;
        this.isDrawing = false;
        this.showGridLines = true;
        this.isGenerated = false;
        this.history = [];
        this.historyIndex = -1;
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
        
        this.initElements();
        this.initNineGridOverlay();
        this.initEventListeners();
        this.loadTheme();
        this.loadSelectedColors();
        this.initAllColorsPalette();
        this.initCollapsibles();
        this.initScrollAnimations();
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
        this.lockGridRatioBtn = document.getElementById('lockGridRatioBtn');
        this.selectGridBtn = document.getElementById('selectGridBtn');
        this.selectionBox = document.getElementById('selectionBox');
        this.nineGridHandles = this.selectionBox ? this.selectionBox.querySelectorAll('[data-handle]') : [];
        
        // 调色板
        this.paletteUsed = document.getElementById('paletteUsed');
        this.paletteAll = document.getElementById('paletteAll');
        this.colorStats = document.getElementById('colorStats');
        this.allColorsGrid = document.getElementById('allColorsGrid');
        
        // 模态框
        this.settingsModal = null; // 已移除
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
        bindClick('selectColorsBtn', () => this.showColorSelectModal());
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

        // 工具选择
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
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

        const gridColsControls = bindRangeAndNumber('gridCols', 'gridColsInput', () => this.updateGridManual());
        const gridRowsControls = bindRangeAndNumber('gridRows', 'gridRowsInput', () => this.updateGridManual());
        const gridOffsetXControls = bindRangeAndNumber('gridOffsetX', 'gridOffsetXInput', () => this.updateGridManual());
        const gridOffsetYControls = bindRangeAndNumber('gridOffsetY', 'gridOffsetYInput', () => this.updateGridManual());

        const offsetHighPrecision = document.getElementById('offsetHighPrecision');
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

        if (gridColsControls) {
            gridColsControls.rangeEl.addEventListener('input', applyLockFromWidth);
            gridColsControls.numberEl.addEventListener('input', applyLockFromWidth);
        }
        if (gridRowsControls) {
            gridRowsControls.rangeEl.addEventListener('input', applyLockFromHeight);
            gridRowsControls.numberEl.addEventListener('input', applyLockFromHeight);
        }
        
        // 自动网格划分
        bindClick('autoGridBtn', () => this.autoCalculateGrid());

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
            if (!e.ctrlKey || !this.uploadedImage) return;
            if (!gridOffsetXControls || !gridOffsetYControls) return;

            const offsetDelta = () => {
                const high = offsetHighPrecision && offsetHighPrecision.checked;
                return high ? 0.005 : 0.05;
            };

            const adjust = (controls, delta) => {
                const next = Math.min(parseFloat(controls.rangeEl.max), Math.max(parseFloat(controls.rangeEl.min), parseFloat(controls.rangeEl.value) + delta));
                controls.rangeEl.value = next;
                controls.numberEl.value = next;
                this.updateGridManual();
            };

            switch(e.key) {
                case 'ArrowUp': e.preventDefault(); adjust(gridOffsetYControls, -offsetDelta()); break;
                case 'ArrowDown': e.preventDefault(); adjust(gridOffsetYControls, offsetDelta()); break;
                case 'ArrowLeft': e.preventDefault(); adjust(gridOffsetXControls, -offsetDelta()); break;
                case 'ArrowRight': e.preventDefault(); adjust(gridOffsetXControls, offsetDelta()); break;
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
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
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
        // 使用固定的合理最大尺寸，避免容器尺寸计算问题
        const maxCanvasWidth = 4096;
        const maxCanvasHeight = 4096;
        
        let width = this.uploadedImage.width;
        let height = this.uploadedImage.height;
        
        // 如果图片太大，按比例缩小（仅在超出安全上限时）
        if (width > maxCanvasWidth || height > maxCanvasHeight) {
            const ratio = Math.min(maxCanvasWidth / width, maxCanvasHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        // 设置画布大小
        this.mainCanvas.width = width;
        this.mainCanvas.height = height;
        
        // 重置网格选择状态，因为图片尺寸已改变
        this.nineGridState = { x: 0, y: 0, width: 0, height: 0 };
        
        // 直接在画布上绘制原始图片
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(this.uploadedImage, 0, 0, width, height);
        
        // 初始化网格数据 - 使用自动计算的值
        this.autoCalculateGrid();

        // 自动适配图片到视图
        this.fitImageToView();
    }

    getMaxZoom() {
        if (!this.mainCanvas || !this.canvasScroll) return 10;
        if (this.mainCanvas.width === 0 || this.mainCanvas.height === 0) return 10;

        const containerW = this.canvasScroll.clientWidth || window.innerWidth;
        const containerH = this.canvasScroll.clientHeight || window.innerHeight;

        // 计算填满屏幕所需的比例
        const ratioW = containerW / this.mainCanvas.width;
        const ratioH = containerH / this.mainCanvas.height;
        const fitRatio = Math.max(ratioW, ratioH);

        // 允许放大到至少能填满屏幕的 5 倍，或者固定的 10 倍（取大者）
        // 同时限制最大像素尺寸，防止浏览器崩溃（一般限制在 30000px 左右）
        const maxPixelDimension = 20000;
        const currentMaxDim = Math.max(this.mainCanvas.width, this.mainCanvas.height);
        const maxSafeZoom = maxPixelDimension / currentMaxDim;

        return Math.min(maxSafeZoom, Math.max(10, fitRatio * 5));
    }

    fitImageToView() {
        if (!this.mainCanvas || !this.canvasScroll) return;

        // 获取容器尺寸（减去一些内边距以保持美观）
        const containerWidth = this.canvasScroll.clientWidth - 40;
        const containerHeight = this.canvasScroll.clientHeight - 40;
        
        if (containerWidth <= 0 || containerHeight <= 0) return;

        const contentWidth = this.mainCanvas.width;
        const contentHeight = this.mainCanvas.height;

        if (contentWidth <= 0 || contentHeight <= 0) return;

        // 计算适配比例
        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        
        // 取较小的比例以确保图片完全显示
        let newZoom = Math.min(scaleX, scaleY);
        
        // 限制最小缩放为 0.1，最大不超过计算出的最大缩放比例
        // 移除原来 Math.min(1, ...) 的限制，允许小图放大以适应屏幕
        newZoom = Math.max(0.1, Math.min(this.getMaxZoom(), newZoom));
        
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
        
        this.saveState();
        this.redrawCanvas();
    }

    ensureNineGridState() {
        if (!this.uploadedImage || !this.selectionBox) return;
        if (this.nineGridState.width > 0 && this.nineGridState.height > 0) return;
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
        
        // 使用 getBoundingClientRect 获取精确的渲染位置和尺寸，解决位置偏差问题
        const canvasRect = this.mainCanvas.getBoundingClientRect();
        const scrollRect = this.canvasScroll.getBoundingClientRect();
        
        const style = getComputedStyle(this.mainCanvas);
        // Visual border width needs to account for zoom
        const borderLeft = (parseFloat(style.borderLeftWidth) || 0) * this.zoomLevel;
        const borderTop = (parseFloat(style.borderTopWidth) || 0) * this.zoomLevel;

        // Canvas 内容区域（排除 border）相对于 scroll 容器的偏移
        // 注意：canvasScroll 是 relative 定位，所以 left/top 是相对于它的 padding box
        // rect.left 是包含 border 的可视左边界
        const contentLeft = canvasRect.left + borderLeft - scrollRect.left + this.canvasScroll.scrollLeft;
        const contentTop = canvasRect.top + borderTop - scrollRect.top + this.canvasScroll.scrollTop;
        
        // Use zoomLevel directly for scaling to avoid rounding errors from rect size
        const scale = this.zoomLevel;
        
        const { x, y, width, height } = this.nineGridState;
        
        this.selectionBox.style.display = 'block';
        this.selectionBox.style.left = (contentLeft + x * scale) + 'px';
        this.selectionBox.style.top = (contentTop + y * scale) + 'px';
        this.selectionBox.style.width = (width * scale) + 'px';
        this.selectionBox.style.height = (height * scale) + 'px';
    }

    onNineGridDrag(e) {
        if (!this.nineGridDrag || (!this.isSelectingGrid && !this.isCropping)) return;
        const { mode, startClientX, startClientY, startState } = this.nineGridDrag;
        
        // Use zoomLevel directly for scaling to ensure consistent coordinate mapping
        const scale = this.zoomLevel;

        const dxCanvas = (e.clientX - startClientX) / scale;
        const dyCanvas = (e.clientY - startClientY) / scale;
        let { x, y, width, height } = startState;

        const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

        if (mode === 'move') {
            x = clamp(x + dxCanvas, 0, Math.max(0, this.mainCanvas.width - width));
            y = clamp(y + dyCanvas, 0, Math.max(0, this.mainCanvas.height - height));
        } else {
            const minSize = 10;
            if (mode.includes('l')) {
                const newX = clamp(x + dxCanvas, 0, x + width - minSize);
                width = width + (x - newX);
                x = newX;
            }
            if (mode.includes('r')) {
                // Ensure max width allows reaching the right edge
                width = clamp(width + dxCanvas, minSize, this.mainCanvas.width - x);
            }
            if (mode.includes('t')) {
                const newY = clamp(y + dyCanvas, 0, y + height - minSize);
                height = height + (y - newY);
                y = newY;
            }
            if (mode.includes('b')) {
                // Ensure max height allows reaching the bottom edge
                height = clamp(height + dyCanvas, minSize, this.mainCanvas.height - y);
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
        const cellWidth = this.nineGridState.width / 3;
        const cellHeight = this.nineGridState.height / 3;
        const offsetX = this.nineGridState.x % cellWidth;
        const offsetY = this.nineGridState.y % cellHeight;

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

        this.updateGridManual();
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

        // 同步九宫格大小（保持 3x3）
        if (this.isSelectingGrid && cellWidth > 0 && cellHeight > 0) {
            this.nineGridState.width = cellWidth * 3;
            this.nineGridState.height = cellHeight * 3;
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
            this.cancelCrop();
            this.initCanvasWithImage();
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
        };
        newImg.src = canvas.toDataURL();
    }

    updateContrastPreview() {
        this.redrawCanvas();
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
        if (this.isSelectingGrid) {
            // 在布局更新后再绘制，避免缩放过渡抖动
            requestAnimationFrame(() => this.renderNineGridOverlay());
        }
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
        if (!this.colorGrid.length) return;
        
        const cols = this.colorGrid[0].length;
        const rows = this.colorGrid.length;
        const { offsetX = 0, offsetY = 0, cellWidth: storedW, cellHeight: storedH } = this.gridData || {};
        const cellWidth = storedW || this.mainCanvas.width / cols;
        const cellHeight = storedH || this.mainCanvas.height / rows;
        
        this.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // 检查是否有任何颜色被分析过
        let hasAnalyzedColors = false;
        for (let row = 0; row < rows && !hasAnalyzedColors; row++) {
            for (let col = 0; col < cols && !hasAnalyzedColors; col++) {
                if (this.colorGrid[row][col].color) {
                    hasAnalyzedColors = true;
                }
            }
        }
        
        // 强制显示原图的情况：未分析，或正在调整对比度
        const showSourceImage = (!hasAnalyzedColors && this.uploadedImage) || (this.isAdjustingContrast && this.uploadedImage);

        // 如果没有分析过颜色，显示原始图片
        if (showSourceImage) {
            
            // 应用对比度滤镜
            if (this.isAdjustingContrast) {
                this.ctx.filter = `contrast(${100 + this.contrastValue}%)`;
            }

            this.ctx.drawImage(this.uploadedImage, 0, 0, this.mainCanvas.width, this.mainCanvas.height);
            
            this.ctx.filter = 'none';

            // 绘制网格线在图片上
            if (this.showGridLines) {
                for (let row = 0; row <= rows; row++) {
                    const y = offsetY + row * cellHeight;
                    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.mainCanvas.width, y);
                    this.ctx.stroke();
                }
                
                for (let col = 0; col <= cols; col++) {
                    const x = offsetX + col * cellWidth;
                    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.mainCanvas.height);
                    this.ctx.stroke();
                }
            }
        } else {
            // 绘制颜色单元格
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = this.colorGrid[row][col];
                    const x = offsetX + col * cellWidth;
                    const y = offsetY + row * cellHeight;
                    
                    if (cell && cell.color) {
                        this.ctx.fillStyle = cell.color.hex;
                        this.ctx.fillRect(x, y, cellWidth, cellHeight);
                    } else {
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillRect(x, y, cellWidth, cellHeight);
                    }
                    
                    // 绘制网格线
                    if (this.showGridLines) {
                        this.ctx.strokeStyle = '#e0e0e0';
                        this.ctx.lineWidth = 0.5;
                        this.ctx.strokeRect(x, y, cellWidth, cellHeight);
                    }
                }
            }
        }
        
        this.updateUsedColorsPalette();
        this.updateColorStats();
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

        if (this.selectedTool) {
            this.mainCanvas.classList.add(`cursor-${this.selectedTool}`);
            if (this.selectedTool === 'pan') {
                this.canvasScroll.style.cursor = 'grab'; // 拖动模式下整个区域都可拖动
            }
        }
    }

    handleCanvasAction(e) {
        if (!this.isGenerated) {
            if (this.editGuard) this.editGuard.style.display = 'flex';
            return;
        }
        const { canvasX: x, canvasY: y } = this.screenToCanvasCoords(e.clientX, e.clientY);
        
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
                
                const cellColor = this.getCellColor(imageData, x, y, cellWidth, cellHeight, tempCanvas.width, tempCanvas.height);
                const closestColors = window.findClosestColors(cellColor);
                
                this.colorGrid[row][col] = {
                    rgb: cellColor,
                    color: closestColors[0],
                    alternatives: closestColors.slice(1)
                };
            }
        }
        
        this.isGenerated = true;
        // 保存原始颜色网格，供颜色合并时作为基线
        this.baseColorGrid = this.cloneColorGrid(this.colorGrid);
        if (this.editGuard) this.editGuard.style.display = 'none';
        const gridSettingsSection = document.getElementById('gridSettingsSection');
        if (gridSettingsSection) gridSettingsSection.style.display = 'none';
        this.saveState();
        this.redrawCanvas();
        if (this.toolsSection) this.toolsSection.classList.remove('tool-locked');
        // 确保退出框选模式，恢复工具可用
        if (this.isSelectingGrid) this.endGridSelection();
        this.updateCursor();

        // 分析完成后自动适配视图
        this.fitImageToView();
    }

    getCellColor(imageData, x, y, w, h, canvasWidth, canvasHeight) {
        const colors = [];
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(canvasWidth, Math.ceil(x + w));
        const endY = Math.min(canvasHeight, Math.ceil(y + h));
        
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const i = (py * canvasWidth + px) * 4;
                colors.push({
                    r: imageData.data[i],
                    g: imageData.data[i + 1],
                    b: imageData.data[i + 2]
                });
            }
        }
        
        if (colors.length === 0) return { r: 255, g: 255, b: 255 };
        
        // 根据颜色识别方式计算
        switch (this.colorMethod) {
            case 'average':
                return this.getAverageColor(colors);
            case 'median':
                return this.getMedianColor(colors);
            case 'center':
                return colors[Math.floor(colors.length / 2)];
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
        const system = this.colorSystem;

        // 对所有颜色进行排序
        const sortedAllColors = [...allColors].sort((a, b) => {
            const idA = window.getDisplayId(a, system);
            const idB = window.getDisplayId(b, system);
            
            // 尝试提取数字部分进行比较
            const numA = parseInt(idA.replace(/\D/g, '')) || 0;
            const numB = parseInt(idB.replace(/\D/g, '')) || 0;
            
            if (numA !== numB) return numA - numB;
            return idA.localeCompare(idB);
        });
        
        let html = '';
        sortedAllColors.forEach(color => {
            const displayId = window.getDisplayId(color, system);
            if (!displayId) return;
            
            html += `
                <div class="color-swatch" 
                     style="background-color: ${color.hex}"
                     data-color-id="${color.id}"
                     title="${displayId}">
                    <span class="swatch-id">${displayId}</span>
                </div>
            `;
        });
        
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
                    const [cr, cc] = queue.pop();
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
                        ctx.font = `${Math.max(10, cellSize / 3)}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
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

            // 色块
            const swatchSize = Math.max(24, Math.round(32 * scale));
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
        // Reset state to avoid flickering or inheriting old/wrong shapes
        this.nineGridState = { x: 0, y: 0, width: 0, height: 0 };
        
        if (this.selectGridBtn) this.selectGridBtn.classList.add('active');
        this.canvasScroll.classList.add('selecting-mode');
        this.mainCanvas.style.cursor = 'crosshair';
        this.gridLinesBeforeSelect = this.showGridLines;
        this.showGridLines = false;
        this.redrawCanvas();

        this.ensureNineGridState();
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
        const rightPanel = document.querySelector('.right-panel');
        const toggleLeft = document.getElementById('toggleLeftPanel');
        const toggleRight = document.getElementById('toggleRightPanel');
        
        // 创建遮罩层
        let overlay = document.querySelector('.panel-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'panel-overlay';
            document.body.appendChild(overlay);
        }
        
        const togglePanel = (panel, show) => {
            // 关闭所有其他面板
            if (show) {
                if (panel !== leftPanel) {
                    leftPanel.classList.remove('show');
                    if (toggleLeft) toggleLeft.classList.remove('active');
                }
                if (panel !== rightPanel) {
                    rightPanel.classList.remove('show');
                    if (toggleRight) toggleRight.classList.remove('active');
                }
            }
            
            panel.classList.toggle('show', show);
            
            // 更新按钮状态
            if (panel === leftPanel && toggleLeft) {
                toggleLeft.classList.toggle('active', show);
            }
            if (panel === rightPanel && toggleRight) {
                toggleRight.classList.toggle('active', show);
            }

            const anyVisible = leftPanel.classList.contains('show') || rightPanel.classList.contains('show');
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
        
        if (toggleRight) {
            toggleRight.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePanel(rightPanel, !rightPanel.classList.contains('show'));
            });
            toggleRight.disabled = false;
        }
        
        // 点击遮罩层关闭面板
        overlay.addEventListener('click', () => {
            togglePanel(leftPanel, false);
            togglePanel(rightPanel, false);
        });
        
        // 监听屏幕方向变化，调整布局
        window.addEventListener('resize', () => {
            // 防止虚拟键盘弹出导致误触调整，可以增加 debounce
            if (window.innerWidth > 768) {
                this.closeMobileMenus();
            }
        });
    }

    closeMobileMenus() {
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');
        const overlay = document.querySelector('.panel-overlay');
        const toggleLeft = document.getElementById('toggleLeftPanel');
        const toggleRight = document.getElementById('toggleRightPanel');

        if (leftPanel) leftPanel.classList.remove('show');
        if (rightPanel) rightPanel.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        if (toggleLeft) toggleLeft.classList.remove('active');
        if (toggleRight) toggleRight.classList.remove('active');
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
