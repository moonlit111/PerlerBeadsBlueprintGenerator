// 拼豆辅助工具 - 主应用程序

class PerlerBeadApp {
    constructor() {
        this.currentStep = 1;
        this.uploadedImage = null;
        this.gridData = null;
        this.colorGrid = [];
        this.selectedTool = 'draw';
        this.selectedColor = null;
        this.colorSystem = 'MARD';
        this.mode = 'manual';
        this.colorMethod = 'average';
        
        this.initElements();
        this.initEventListeners();
        this.loadSelectedColors();
    }

    initElements() {
        // 面板元素
        this.panels = {
            upload: document.getElementById('panel-upload'),
            grid: document.getElementById('panel-grid'),
            edit: document.getElementById('panel-edit'),
            export: document.getElementById('panel-export')
        };

        // 上传相关
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.previewImage = document.getElementById('previewImage');

        // 网格相关
        this.gridCanvas = document.getElementById('gridCanvas');
        this.gridCtx = this.gridCanvas.getContext('2d');

        // 编辑相关
        this.editCanvas = document.getElementById('editCanvas');
        this.editCtx = this.editCanvas.getContext('2d');
        this.colorPalette = document.getElementById('colorPalette');

        // 导出相关
        this.exportCanvas = document.getElementById('exportCanvas');
        this.exportCtx = this.exportCanvas.getContext('2d');
        this.colorStats = document.getElementById('colorStats');

        // 模态框
        this.colorSelectModal = document.getElementById('colorSelectModal');
        this.colorSelectList = document.getElementById('colorSelectList');
    }

    initEventListeners() {
        // 上传图片
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });
        this.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });
        document.getElementById('reuploadBtn').addEventListener('click', () => {
            this.resetUpload();
        });
        document.getElementById('nextToGridBtn').addEventListener('click', () => {
            this.goToStep(2);
        });

        // 模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                this.updateModeControls();
            });
        });

        // 网格控制
        document.getElementById('gridCols').addEventListener('input', (e) => {
            this.updateGridPreview();
        });
        document.getElementById('gridRows').addEventListener('input', (e) => {
            this.updateGridPreview();
        });
        document.getElementById('offsetX').addEventListener('input', (e) => {
            document.getElementById('offsetXValue').textContent = e.target.value;
            this.updateGridPreview();
        });
        document.getElementById('offsetY').addEventListener('input', (e) => {
            document.getElementById('offsetYValue').textContent = e.target.value;
            this.updateGridPreview();
        });
        document.getElementById('applyGridBtn').addEventListener('click', () => {
            this.updateGridPreview();
        });
        document.getElementById('autoDetectBtn').addEventListener('click', () => {
            this.autoDetectGrid();
        });
        document.getElementById('colorMethod').addEventListener('change', (e) => {
            this.colorMethod = e.target.value;
        });
        document.getElementById('analyzeColorsBtn').addEventListener('click', () => {
            this.analyzeColors();
        });

        // 颜色系统选择
        document.getElementById('colorSystem').addEventListener('change', (e) => {
            this.colorSystem = e.target.value;
            this.updateColorPalette();
            this.redrawEditCanvas();
        });
        document.getElementById('selectColorsBtn').addEventListener('click', () => {
            this.showColorSelectModal();
        });

        // 工具选择
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTool = btn.dataset.tool;
            });
        });

        // 编辑画布交互
        this.editCanvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
        this.editCanvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.editCanvas.addEventListener('mouseup', () => this.handleCanvasMouseUp());
        this.editCanvas.addEventListener('mouseleave', () => this.handleCanvasMouseUp());

        // 导航按钮
        document.getElementById('backToGridBtn').addEventListener('click', () => {
            this.goToStep(2);
        });
        document.getElementById('nextToExportBtn').addEventListener('click', () => {
            this.goToStep(4);
        });
        document.getElementById('backToEditBtn').addEventListener('click', () => {
            this.goToStep(3);
        });
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadBlueprint();
        });

        // 导出选项
        document.getElementById('exportStyle').addEventListener('change', () => {
            this.updateExportPreview();
        });
        document.getElementById('showBorder').addEventListener('change', () => {
            this.updateExportPreview();
        });
        document.getElementById('cellSize').addEventListener('input', () => {
            this.updateExportPreview();
        });

        // 颜色选择模态框
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideColorSelectModal();
        });
        document.getElementById('cancelSelectBtn').addEventListener('click', () => {
            this.hideColorSelectModal();
        });
        document.getElementById('confirmSelectBtn').addEventListener('click', () => {
            this.saveColorSelection();
        });
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAllColors(true);
        });
        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.selectAllColors(false);
        });
    }

    // 步骤导航
    goToStep(step) {
        // 隐藏所有面板
        Object.values(this.panels).forEach(panel => panel.style.display = 'none');
        
        // 更新步骤指示器
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
        
        // 显示对应面板
        this.currentStep = step;
        switch(step) {
            case 1:
                this.panels.upload.style.display = 'block';
                break;
            case 2:
                this.panels.grid.style.display = 'block';
                this.initGridCanvas();
                break;
            case 3:
                this.panels.edit.style.display = 'block';
                this.initEditCanvas();
                break;
            case 4:
                this.panels.export.style.display = 'block';
                this.updateExportPreview();
                this.updateColorStatistics();
                break;
        }
    }

    // 图片上传处理
    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.uploadedImage = img;
                this.previewImage.src = e.target.result;
                this.uploadArea.style.display = 'none';
                this.previewContainer.style.display = 'flex';
                document.getElementById('nextToGridBtn').style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetUpload() {
        this.uploadedImage = null;
        this.previewImage.src = '';
        this.uploadArea.style.display = 'flex';
        this.previewContainer.style.display = 'none';
        document.getElementById('nextToGridBtn').style.display = 'none';
        this.imageInput.value = '';
    }

    // 网格模式控制
    updateModeControls() {
        const manualControls = document.getElementById('manualControls');
        const autoControls = document.getElementById('autoControls');
        
        if (this.mode === 'manual') {
            manualControls.style.display = 'block';
            autoControls.style.display = 'none';
        } else {
            manualControls.style.display = 'none';
            autoControls.style.display = 'block';
        }
        
        this.updateGridPreview();
    }

    // 初始化网格画布
    initGridCanvas() {
        if (!this.uploadedImage) return;
        
        const maxWidth = 800;
        const maxHeight = 600;
        let width = this.uploadedImage.width;
        let height = this.uploadedImage.height;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        this.gridCanvas.width = width;
        this.gridCanvas.height = height;
        
        this.updateGridPreview();
    }

    // 更新网格预览
    updateGridPreview() {
        if (!this.uploadedImage) return;
        
        this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        this.gridCtx.drawImage(this.uploadedImage, 0, 0, this.gridCanvas.width, this.gridCanvas.height);
        
        if (this.mode === 'manual') {
            const cols = parseInt(document.getElementById('gridCols').value);
            const rows = parseInt(document.getElementById('gridRows').value);
            const offsetX = parseInt(document.getElementById('offsetX').value);
            const offsetY = parseInt(document.getElementById('offsetY').value);
            
            this.drawGrid(cols, rows, offsetX, offsetY);
            this.gridData = { cols, rows, offsetX, offsetY };
        }
    }

    // 绘制网格
    drawGrid(cols, rows, offsetX = 0, offsetY = 0) {
        const cellWidth = this.gridCanvas.width / cols;
        const cellHeight = this.gridCanvas.height / rows;
        
        this.gridCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.gridCtx.lineWidth = 1;
        
        // 绘制垂直线
        for (let i = 0; i <= cols; i++) {
            const x = i * cellWidth + offsetX;
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, this.gridCanvas.height);
            this.gridCtx.stroke();
        }
        
        // 绘制水平线
        for (let i = 0; i <= rows; i++) {
            const y = i * cellHeight + offsetY;
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(this.gridCanvas.width, y);
            this.gridCtx.stroke();
        }
    }

    // 自动检测网格
    autoDetectGrid() {
        if (!this.uploadedImage) return;
        
        const targetSize = parseInt(document.getElementById('autoGridSize').value);
        const imageWidth = this.gridCanvas.width;
        const imageHeight = this.gridCanvas.height;
        
        // 根据图片尺寸自动计算网格数
        const aspectRatio = imageWidth / imageHeight;
        let cols, rows;
        
        if (aspectRatio > 1) {
            cols = targetSize;
            rows = Math.round(targetSize / aspectRatio);
        } else {
            rows = targetSize;
            cols = Math.round(targetSize * aspectRatio);
        }
        
        document.getElementById('gridCols').value = cols;
        document.getElementById('gridRows').value = rows;
        
        this.mode = 'manual';
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.mode-btn[data-mode="manual"]').classList.add('active');
        this.updateModeControls();
        this.updateGridPreview();
    }

    // 分析颜色
    analyzeColors() {
        if (!this.gridData) {
            alert('请先设置网格');
            return;
        }
        
        const { cols, rows, offsetX, offsetY } = this.gridData;
        const cellWidth = this.gridCanvas.width / cols;
        const cellHeight = this.gridCanvas.height / rows;
        
        // 获取图像数据
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.gridCanvas.width;
        tempCanvas.height = this.gridCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 初始化颜色网格
        this.colorGrid = [];
        
        for (let row = 0; row < rows; row++) {
            const rowData = [];
            for (let col = 0; col < cols; col++) {
                const x = col * cellWidth + offsetX;
                const y = row * cellHeight + offsetY;
                const w = cellWidth;
                const h = cellHeight;
                
                // 获取单元格颜色
                const cellColor = this.getCellColor(imageData, x, y, w, h, tempCanvas.width, tempCanvas.height);
                
                // 查找最接近的拼豆颜色
                const closestColors = window.findClosestColors(cellColor);
                const bestMatch = closestColors[0];
                
                rowData.push({
                    rgb: cellColor,
                    color: bestMatch,
                    alternatives: closestColors.slice(1)
                });
            }
            this.colorGrid.push(rowData);
        }
        
        this.goToStep(3);
    }

    // 获取单元格颜色
    getCellColor(imageData, x, y, w, h, canvasWidth, canvasHeight) {
        const method = this.colorMethod;
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
        
        if (colors.length === 0) {
            return { r: 255, g: 255, b: 255 };
        }
        
        switch (method) {
            case 'average':
                return this.getAverageColor(colors);
            case 'dominant':
                return this.getDominantColor(colors);
            case 'median':
                return this.getMedianColor(colors);
            case 'center':
                return colors[Math.floor(colors.length / 2)];
            default:
                return this.getAverageColor(colors);
        }
    }

    // 平均颜色
    getAverageColor(colors) {
        const sum = colors.reduce((acc, color) => ({
            r: acc.r + color.r,
            g: acc.g + color.g,
            b: acc.b + color.b
        }), { r: 0, g: 0, b: 0 });
        
        return {
            r: Math.round(sum.r / colors.length),
            g: Math.round(sum.g / colors.length),
            b: Math.round(sum.b / colors.length)
        };
    }

    // 主导颜色
    getDominantColor(colors) {
        // 简化版本：使用k-means算法的简化版，这里用平均色代替
        return this.getAverageColor(colors);
    }

    // 中位数颜色
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

    // 初始化编辑画布
    initEditCanvas() {
        if (!this.colorGrid || this.colorGrid.length === 0) return;
        
        const rows = this.colorGrid.length;
        const cols = this.colorGrid[0].length;
        const cellSize = 30;
        
        this.editCanvas.width = cols * cellSize;
        this.editCanvas.height = rows * cellSize;
        
        this.updateColorPalette();
        this.redrawEditCanvas();
    }

    // 重绘编辑画布
    redrawEditCanvas() {
        if (!this.colorGrid || this.colorGrid.length === 0) return;
        
        const rows = this.colorGrid.length;
        const cols = this.colorGrid[0].length;
        const cellSize = this.editCanvas.width / cols;
        
        this.editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = this.colorGrid[row][col];
                if (cell && cell.color) {
                    const x = col * cellSize;
                    const y = row * cellSize;
                    
                    this.editCtx.fillStyle = cell.color.hex;
                    this.editCtx.fillRect(x, y, cellSize, cellSize);
                    
                    this.editCtx.strokeStyle = '#ddd';
                    this.editCtx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }
    }

    // 更新调色板
    updateColorPalette() {
        if (!this.colorGrid || this.colorGrid.length === 0) return;
        
        // 获取所有使用的颜色
        const usedColors = new Map();
        this.colorGrid.forEach(row => {
            row.forEach(cell => {
                if (cell && cell.color) {
                    usedColors.set(cell.color.id, cell.color);
                }
            });
        });
        
        // 生成调色板
        this.colorPalette.innerHTML = '<h3>使用的颜色</h3>';
        const paletteGrid = document.createElement('div');
        paletteGrid.className = 'palette-grid';
        
        usedColors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'palette-item';
            if (this.selectedColor && this.selectedColor.id === color.id) {
                colorItem.classList.add('selected');
            }
            
            const colorBox = document.createElement('div');
            colorBox.className = 'palette-color';
            colorBox.style.backgroundColor = color.hex;
            
            const colorId = document.createElement('div');
            colorId.className = 'palette-id';
            const displayId = window.getDisplayId(color, this.colorSystem);
            colorId.textContent = displayId || color.id;
            
            colorItem.appendChild(colorBox);
            colorItem.appendChild(colorId);
            
            colorItem.addEventListener('click', () => {
                document.querySelectorAll('.palette-item').forEach(item => {
                    item.classList.remove('selected');
                });
                colorItem.classList.add('selected');
                this.selectedColor = color;
            });
            
            paletteGrid.appendChild(colorItem);
        });
        
        this.colorPalette.appendChild(paletteGrid);
    }

    // 画布交互
    handleCanvasMouseDown(e) {
        this.isDrawing = true;
        this.handleCanvasDraw(e);
    }

    handleCanvasMouseMove(e) {
        if (!this.isDrawing) return;
        this.handleCanvasDraw(e);
    }

    handleCanvasMouseUp() {
        this.isDrawing = false;
    }

    handleCanvasDraw(e) {
        const rect = this.editCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cols = this.colorGrid[0].length;
        const rows = this.colorGrid.length;
        const cellSize = this.editCanvas.width / cols;
        
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        
        if (col < 0 || col >= cols || row < 0 || row >= rows) return;
        
        switch (this.selectedTool) {
            case 'draw':
                if (this.selectedColor) {
                    this.colorGrid[row][col].color = this.selectedColor;
                    this.redrawEditCanvas();
                }
                break;
            case 'fill':
                if (this.selectedColor) {
                    const targetColor = this.colorGrid[row][col].color;
                    this.floodFill(col, row, targetColor, this.selectedColor);
                    this.redrawEditCanvas();
                }
                break;
            case 'eraser':
                this.colorGrid[row][col].color = null;
                this.redrawEditCanvas();
                break;
        }
    }

    // 填充算法
    floodFill(startCol, startRow, targetColor, fillColor) {
        if (!targetColor || targetColor.id === fillColor.id) return;
        
        const stack = [[startCol, startRow]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [col, row] = stack.pop();
            const key = `${col},${row}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (row < 0 || row >= this.colorGrid.length) continue;
            if (col < 0 || col >= this.colorGrid[0].length) continue;
            
            const cell = this.colorGrid[row][col];
            if (!cell.color || cell.color.id !== targetColor.id) continue;
            
            cell.color = fillColor;
            
            stack.push([col + 1, row]);
            stack.push([col - 1, row]);
            stack.push([col, row + 1]);
            stack.push([col, row - 1]);
        }
    }

    // 更新导出预览
    updateExportPreview() {
        if (!this.colorGrid || this.colorGrid.length === 0) return;
        
        const style = document.getElementById('exportStyle').value;
        const showBorder = document.getElementById('showBorder').checked;
        const cellSize = parseInt(document.getElementById('cellSize').value);
        
        const rows = this.colorGrid.length;
        const cols = this.colorGrid[0].length;
        
        this.exportCanvas.width = cols * cellSize;
        this.exportCanvas.height = rows * cellSize;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = this.colorGrid[row][col];
                if (!cell || !cell.color) continue;
                
                const x = col * cellSize;
                const y = row * cellSize;
                
                // 绘制背景色
                if (style === 'color' || style === 'both') {
                    this.exportCtx.fillStyle = cell.color.hex;
                    this.exportCtx.fillRect(x, y, cellSize, cellSize);
                } else {
                    this.exportCtx.fillStyle = '#ffffff';
                    this.exportCtx.fillRect(x, y, cellSize, cellSize);
                }
                
                // 绘制边框
                if (showBorder) {
                    this.exportCtx.strokeStyle = '#333';
                    this.exportCtx.lineWidth = 1;
                    this.exportCtx.strokeRect(x, y, cellSize, cellSize);
                }
                
                // 绘制色号
                if (style === 'grid' || style === 'both') {
                    const displayId = window.getDisplayId(cell.color, this.colorSystem);
                    if (displayId) {
                        this.exportCtx.fillStyle = style === 'both' ? '#000' : '#333';
                        this.exportCtx.font = `${Math.max(8, cellSize / 3)}px Arial`;
                        this.exportCtx.textAlign = 'center';
                        this.exportCtx.textBaseline = 'middle';
                        this.exportCtx.fillText(displayId, x + cellSize / 2, y + cellSize / 2);
                    }
                }
            }
        }
    }

    // 更新颜色统计
    updateColorStatistics() {
        if (!this.colorGrid || this.colorGrid.length === 0) return;
        
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
        
        const sortedColors = Array.from(colorCount.entries())
            .sort((a, b) => b[1] - a[1]);
        
        let html = '<div class="stats-list">';
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
                        <span class="stat-id">${displayId || id}</span>
                        <span class="stat-count">${count}颗 (${percentage}%)</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        this.colorStats.innerHTML = html;
    }

    // 下载图纸
    downloadBlueprint() {
        const link = document.createElement('a');
        link.download = `拼豆图纸_${Date.now()}.png`;
        link.href = this.exportCanvas.toDataURL('image/png');
        link.click();
    }

    // 颜色选择模态框
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
        
        // 按系统分组
        const groups = new Map();
        allColors.forEach(color => {
            const group = window.getGroupBySystem(color, system);
            const displayId = window.getDisplayId(color, system);
            
            // 如果没有对应色号，跳过
            if (!displayId) return;
            
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.set(group, [...groups.get(group), color]);
        });
        
        let html = '';
        groups.forEach((colors, group) => {
            html += `<div class="color-group">`;
            html += `<h3 class="group-title">${group}系列</h3>`;
            html += `<div class="color-grid">`;
            
            colors.forEach(color => {
                const isSelected = selectedIds.has(color.id) || selectedIds.has(window.normalizeColorId(color.id));
                const displayId = window.getDisplayId(color, system);
                
                html += `
                    <div class="color-checkbox-item">
                        <input type="checkbox" 
                               id="color-${color.id}" 
                               value="${color.id}" 
                               ${isSelected ? 'checked' : ''}>
                        <label for="color-${color.id}">
                            <div class="color-sample" style="background-color: ${color.hex}"></div>
                            <span>${displayId}</span>
                        </label>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        this.colorSelectList.innerHTML = html;
    }

    selectAllColors(select) {
        const checkboxes = this.colorSelectList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = select);
    }

    saveColorSelection() {
        const checkboxes = this.colorSelectList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedIds = new Set();
        checkboxes.forEach(cb => selectedIds.add(cb.value));
        
        window.saveSelectedColorIds(selectedIds);
        this.hideColorSelectModal();
        
        // 如果在编辑步骤，重新生成调色板
        if (this.currentStep === 3) {
            this.updateColorPalette();
        }
    }

    loadSelectedColors() {
        // 初始加载时，如果没有选择任何颜色，默认全选
        const selectedIds = window.getSelectedColorIds();
        if (selectedIds.size === 0) {
            const allColors = window.getAllColors();
            const allIds = new Set(allColors.map(c => c.id));
            window.saveSelectedColorIds(allIds);
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PerlerBeadApp();
});
