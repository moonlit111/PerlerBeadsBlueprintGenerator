// 图像处理工具类

class ImageProcessor {
    /**
     * 检测图像中的网格结构
     * @param {ImageData} imageData - 图像数据
     * @returns {Object} 检测到的网格信息
     */
    static detectGrid(imageData) {
        const { width, height, data } = imageData;
        
        // 转换为灰度图
        const grayData = this.toGrayscale(data, width, height);
        
        // 边缘检测
        const edges = this.detectEdges(grayData, width, height);
        
        // 检测水平和垂直线
        const horizontalLines = this.detectHorizontalLines(edges, width, height);
        const verticalLines = this.detectVerticalLines(edges, width, height);
        
        // 计算网格参数
        const cols = verticalLines.length - 1;
        const rows = horizontalLines.length - 1;
        
        return {
            cols: Math.max(1, cols),
            rows: Math.max(1, rows),
            offsetX: 0,
            offsetY: 0
        };
    }

    /**
     * 转换为灰度图
     */
    static toGrayscale(data, width, height) {
        const grayData = new Uint8Array(width * height);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            grayData[i / 4] = gray;
        }
        
        return grayData;
    }

    /**
     * Sobel边缘检测
     */
    static detectEdges(grayData, width, height) {
        const edges = new Uint8Array(width * height);
        
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0;
                let gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixel = grayData[(y + ky) * width + (x + kx)];
                        gx += pixel * sobelX[ky + 1][kx + 1];
                        gy += pixel * sobelY[ky + 1][kx + 1];
                    }
                }
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edges[y * width + x] = Math.min(255, magnitude);
            }
        }
        
        return edges;
    }

    /**
     * 检测水平线
     */
    static detectHorizontalLines(edges, width, height) {
        const lines = [];
        const threshold = width * 0.3; // 至少30%的宽度
        
        for (let y = 0; y < height; y++) {
            let count = 0;
            for (let x = 0; x < width; x++) {
                if (edges[y * width + x] > 128) {
                    count++;
                }
            }
            
            if (count > threshold) {
                lines.push(y);
            }
        }
        
        // 合并相邻的线
        return this.mergeLines(lines, 5);
    }

    /**
     * 检测垂直线
     */
    static detectVerticalLines(edges, width, height) {
        const lines = [];
        const threshold = height * 0.3; // 至少30%的高度
        
        for (let x = 0; x < width; x++) {
            let count = 0;
            for (let y = 0; y < height; y++) {
                if (edges[y * width + x] > 128) {
                    count++;
                }
            }
            
            if (count > threshold) {
                lines.push(x);
            }
        }
        
        // 合并相邻的线
        return this.mergeLines(lines, 5);
    }

    /**
     * 合并相邻的线
     */
    static mergeLines(lines, distance) {
        if (lines.length === 0) return [];
        
        const merged = [lines[0]];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i] - merged[merged.length - 1] > distance) {
                merged.push(lines[i]);
            }
        }
        
        return merged;
    }

    /**
     * 获取单元格的主导颜色
     * @param {ImageData} imageData - 图像数据
     * @param {number} x - 单元格左上角x坐标
     * @param {number} y - 单元格左上角y坐标
     * @param {number} width - 单元格宽度
     * @param {number} height - 单元格高度
     * @returns {Object} RGB颜色值
     */
    static getCellDominantColor(imageData, x, y, width, height) {
        const colors = [];
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(imageData.width, Math.ceil(x + width));
        const endY = Math.min(imageData.height, Math.ceil(y + height));
        
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const i = (py * imageData.width + px) * 4;
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
        
        // 使用k-means聚类找出主导颜色
        return this.kMeansClustering(colors, 1)[0];
    }

    /**
     * K-means聚类算法
     * @param {Array} colors - 颜色数组
     * @param {number} k - 聚类数量
     * @returns {Array} 聚类中心
     */
    static kMeansClustering(colors, k) {
        if (colors.length === 0) return [{ r: 0, g: 0, b: 0 }];
        if (colors.length <= k) return colors;
        
        // 初始化聚类中心（随机选择）
        const centers = [];
        const step = Math.floor(colors.length / k);
        for (let i = 0; i < k; i++) {
            centers.push({ ...colors[i * step] });
        }
        
        // 迭代优化
        const maxIterations = 10;
        for (let iter = 0; iter < maxIterations; iter++) {
            const clusters = Array(k).fill(null).map(() => []);
            
            // 分配颜色到最近的聚类中心
            colors.forEach(color => {
                let minDist = Infinity;
                let clusterIndex = 0;
                
                centers.forEach((center, i) => {
                    const dist = this.colorDistance(color, center);
                    if (dist < minDist) {
                        minDist = dist;
                        clusterIndex = i;
                    }
                });
                
                clusters[clusterIndex].push(color);
            });
            
            // 更新聚类中心
            for (let i = 0; i < k; i++) {
                if (clusters[i].length > 0) {
                    const sum = clusters[i].reduce((acc, c) => ({
                        r: acc.r + c.r,
                        g: acc.g + c.g,
                        b: acc.b + c.b
                    }), { r: 0, g: 0, b: 0 });
                    
                    centers[i] = {
                        r: Math.round(sum.r / clusters[i].length),
                        g: Math.round(sum.g / clusters[i].length),
                        b: Math.round(sum.b / clusters[i].length)
                    };
                }
            }
        }
        
        return centers;
    }

    /**
     * 计算两个颜色之间的欧氏距离
     */
    static colorDistance(c1, c2) {
        const dr = c1.r - c2.r;
        const dg = c1.g - c2.g;
        const db = c1.b - c2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    /**
     * 获取单元格的平均颜色
     */
    static getCellAverageColor(imageData, x, y, width, height) {
        let r = 0, g = 0, b = 0, count = 0;
        
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(imageData.width, Math.ceil(x + width));
        const endY = Math.min(imageData.height, Math.ceil(y + height));
        
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const i = (py * imageData.width + px) * 4;
                r += imageData.data[i];
                g += imageData.data[i + 1];
                b += imageData.data[i + 2];
                count++;
            }
        }
        
        if (count === 0) {
            return { r: 255, g: 255, b: 255 };
        }
        
        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }

    /**
     * 获取单元格的中位数颜色
     */
    static getCellMedianColor(imageData, x, y, width, height) {
        const reds = [], greens = [], blues = [];
        
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(imageData.width, Math.ceil(x + width));
        const endY = Math.min(imageData.height, Math.ceil(y + height));
        
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const i = (py * imageData.width + px) * 4;
                reds.push(imageData.data[i]);
                greens.push(imageData.data[i + 1]);
                blues.push(imageData.data[i + 2]);
            }
        }
        
        if (reds.length === 0) {
            return { r: 255, g: 255, b: 255 };
        }
        
        reds.sort((a, b) => a - b);
        greens.sort((a, b) => a - b);
        blues.sort((a, b) => a - b);
        
        const mid = Math.floor(reds.length / 2);
        
        return {
            r: reds[mid],
            g: greens[mid],
            b: blues[mid]
        };
    }

    /**
     * 获取单元格中心点颜色
     */
    static getCellCenterColor(imageData, x, y, width, height) {
        const centerX = Math.floor(x + width / 2);
        const centerY = Math.floor(y + height / 2);
        
        if (centerX < 0 || centerX >= imageData.width || 
            centerY < 0 || centerY >= imageData.height) {
            return { r: 255, g: 255, b: 255 };
        }
        
        const i = (centerY * imageData.width + centerX) * 4;
        
        return {
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2]
        };
    }

    /**
     * 颜色量化
     * @param {Array} colors - 颜色数组
     * @param {number} levels - 量化级别
     * @returns {Array} 量化后的颜色
     */
    static quantizeColors(colors, levels = 8) {
        const step = 256 / levels;
        
        return colors.map(color => ({
            r: Math.round(color.r / step) * step,
            g: Math.round(color.g / step) * step,
            b: Math.round(color.b / step) * step
        }));
    }

    /**
     * 颜色直方图
     */
    static colorHistogram(imageData) {
        const histogram = {
            r: new Array(256).fill(0),
            g: new Array(256).fill(0),
            b: new Array(256).fill(0)
        };
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            histogram.r[imageData.data[i]]++;
            histogram.g[imageData.data[i + 1]]++;
            histogram.b[imageData.data[i + 2]]++;
        }
        
        return histogram;
    }

    /**
     * 对比度增强
     */
    static enhanceContrast(imageData, factor = 1.5) {
        const enhanced = new Uint8ClampedArray(imageData.data);
        
        for (let i = 0; i < enhanced.length; i += 4) {
            enhanced[i] = Math.min(255, ((enhanced[i] - 128) * factor) + 128);
            enhanced[i + 1] = Math.min(255, ((enhanced[i + 1] - 128) * factor) + 128);
            enhanced[i + 2] = Math.min(255, ((enhanced[i + 2] - 128) * factor) + 128);
        }
        
        return new ImageData(enhanced, imageData.width, imageData.height);
    }

    /**
     * 高斯模糊
     */
    static gaussianBlur(imageData, radius = 1) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const output = new Uint8ClampedArray(data);
        
        const kernel = this.generateGaussianKernel(radius);
        const kernelSize = kernel.length;
        const half = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, weightSum = 0;
                
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const px = x + kx - half;
                        const py = y + ky - half;
                        
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const i = (py * width + px) * 4;
                            const weight = kernel[ky][kx];
                            
                            r += data[i] * weight;
                            g += data[i + 1] * weight;
                            b += data[i + 2] * weight;
                            weightSum += weight;
                        }
                    }
                }
                
                const i = (y * width + x) * 4;
                output[i] = r / weightSum;
                output[i + 1] = g / weightSum;
                output[i + 2] = b / weightSum;
            }
        }
        
        return new ImageData(output, width, height);
    }

    /**
     * 生成高斯核
     */
    static generateGaussianKernel(radius) {
        const size = radius * 2 + 1;
        const kernel = Array(size).fill(null).map(() => Array(size).fill(0));
        const sigma = radius / 3;
        const twoSigmaSquare = 2 * sigma * sigma;
        let sum = 0;
        
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                const value = Math.exp(-(x * x + y * y) / twoSigmaSquare);
                kernel[y + radius][x + radius] = value;
                sum += value;
            }
        }
        
        // 归一化
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                kernel[y][x] /= sum;
            }
        }
        
        return kernel;
    }
}

// 导出到全局作用域
window.ImageProcessor = ImageProcessor;
