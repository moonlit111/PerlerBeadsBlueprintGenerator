// 图像处理工具类

class ImageProcessor {
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

}

// 导出到全局作用域
window.ImageProcessor = ImageProcessor;
