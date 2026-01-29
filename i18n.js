/**
 * 国际化资源文件
 */
const translations = {
    "zh-CN": {
        "app_title": "拼豆图纸工坊",
        "tab_generation": "图纸生成",
        "tab_editing": "图纸编辑",
        "tab_identify": "颜色识别",
        "toolbar_tools": "工具",
        "toolbar_theme": "切换主题",
        
        // 侧边栏标题
        "section_image_process": "图片处理",
        "section_grid_settings": "网格设置",
        "section_view_process": "视图与处理",
        "section_palette": "调色板",
        "section_identify_result": "颜色识别结果",
        
        // 图片处理
        "btn_rotate_left": "左旋转",
        "btn_rotate_right": "右旋转",
        "btn_crop": "裁剪",
        "btn_contrast": "对比度",
        "btn_resize": "缩放",
        "btn_undo_image": "撤销",
        "btn_confirm_crop": "确认裁剪",
        "btn_cancel": "取消",
        "label_scale_ratio": "缩放比例 (倍)",
        "label_target_width": "目标宽度 (px)",
        "label_target_height": "目标高度 (px)",
        "label_resize_algo": "缩放算法",
        "algo_smooth": "平滑 (Bilinear)",
        "algo_pixelated": "像素化 (Nearest)",
        "btn_confirm": "确认",
        "label_contrast": "对比度",
        
        // 网格设置
        "label_grid_select_size": "框选网格大小 (NxN)",
        "label_grid_width": "网格宽度(px/格) (A/D)",
        "label_grid_height": "网格高度(px/格) (W/S)",
        "label_offset_x": "横轴偏移(px) (Ctrl ←/→)",
        "label_offset_y": "纵轴偏移(px) (Ctrl ↑/↓)",
        "label_high_precision": "高精度偏移",
        "btn_select_grid": "框选网格",
        
        // 视图与处理
        "label_zoom": "缩放比例",
        "label_detect_method": "识别方式",
        "method_dominant": "主导颜色",
        "method_average": "平均颜色",
        "label_merge_threshold": "颜色合并阈值",
        "btn_merge_colors": "颜色合并",
        "btn_compare": "对比原图/图纸",
        "btn_show_original": "显示原图",
        "btn_show_blueprint": "显示图纸",
        "btn_gen_and_edit": "生成并编辑",
        "tab_used_colors": "使用的颜色",
        "tab_all_colors": "全部颜色",
        "tab_stats": "颜色统计",
        "msg_no_used_colors": "暂无使用的颜色",
        "msg_no_stats": "暂无统计数据",
        "label_color_code": "未选择",
        
        // 颜色识别
        "msg_pick_color": "点击画布取色",
        "label_closest_color": "最接近的颜色",
        "msg_click_to_identify": "点击画布任意位置识别颜色",
        
        // 顶部工具栏 (生成)
        "btn_upload": "上传图片",
        "btn_generate": "生成图纸",
        "btn_select_colors": "选择颜色",
        "btn_send_to_edit": "发送到编辑区",
        
        // 顶部工具栏 (编辑)
        "tool_pan": "拖动",
        "tool_brush": "画笔",
        "tool_bucket": "油漆桶",
        "tool_replace": "替换同色",
        "tool_eraser": "橡皮擦",
        "tool_eyedropper": "吸管",
        "tool_remove_bg": "移除背景",
        "tool_undo": "撤销",
        "tool_redo": "重做",
        "tool_export": "导出图纸",
        "tool_clear": "清空画布",
        
        // 欢迎页
        "welcome_title": "上传图片开始创作",
        "welcome_desc": "支持 JPG、PNG、GIF 格式",
        "btn_select_image": "选择图片",
        
        // 画布信息
        "info_canvas_size": "画布大小",
        "info_color_count": "颜色数",
        
        // 颜色选择模态框
        "modal_select_colors_title": "选择拥有的颜色",
        "label_color_system": "色号系统",
        "text_selected": "已选",
        "text_total": "总计",
        "btn_select_all": "全选",
        "btn_deselect_all": "取消全选",
        "text_series": "系列",
        "btn_group_select_all": "本组全选",
        "btn_group_deselect_all": "本组全不选",
        
        // 导出模态框
        "modal_export_title": "下载图纸设置",
        "label_show_grid": "显示网格线",
        "label_line_interval": "线条间隔",
        "label_line_color": "线条颜色",
        "label_show_coords": "显示坐标",
        "label_coord_interval": "坐标分度",
        "label_hide_codes": "隐藏色号",
        "label_include_stats": "包含统计",
        "btn_copy_clipboard": "复制到剪贴板",
        "btn_download": "下载图纸",
        
        // JS 动态消息
        "msg_generate_first": "请先生成图纸",
        "msg_bg_not_detected": "边缘未检测到预设背景色(T1/H1)",
        "msg_bg_removed": "已移除 {count} 个背景格子",
        "msg_bg_not_found": "未找到可移除的背景区域",
        "msg_upload_first": "请先上传图片",
        "msg_img_too_small": "图片尺寸较小，建议放大以获得更好效果",
        "msg_select_color_first": "请先选择一个颜色",
        "msg_create_pattern_first": "请先创建或编辑图案",
        "msg_clipboard_unsupported": "当前浏览器不支持复制图片到剪贴板",
        "msg_copied": "已复制到剪贴板",
        "msg_copy_failed": "复制失败，请检查权限",
        "msg_confirm_clear": "确定要清空画布吗？",
        "text_color_stats": "颜色统计",
        "text_custom": "自定义",
        "msg_no_match_color": "没有找到匹配的颜色",
        "btn_lock_ratio": "锁定宽高比例"
    },
    "en": {
        "app_title": "Perler Beads Blueprint Generator",
        "tab_generation": "Generator",
        "tab_editing": "Editor",
        "tab_identify": "Identifier",
        "toolbar_tools": "Tools",
        "toolbar_theme": "Toggle Theme",
        
        "section_image_process": "Image Processing",
        "section_grid_settings": "Grid Settings",
        "section_view_process": "View & Process",
        "section_palette": "Palette",
        "section_identify_result": "Identification Result",
        
        "btn_rotate_left": "Rotate Left",
        "btn_rotate_right": "Rotate Right",
        "btn_crop": "Crop",
        "btn_contrast": "Contrast",
        "btn_resize": "Resize",
        "btn_undo_image": "Undo",
        "btn_confirm_crop": "Confirm Crop",
        "btn_cancel": "Cancel",
        "label_scale_ratio": "Scale Ratio (x)",
        "label_target_width": "Target Width (px)",
        "label_target_height": "Target Height (px)",
        "label_resize_algo": "Algorithm",
        "algo_smooth": "Smooth (Bilinear)",
        "algo_pixelated": "Pixelated (Nearest)",
        "btn_confirm": "Confirm",
        "label_contrast": "Contrast",
        
        "label_grid_select_size": "Selection Grid Size (NxN)",
        "label_grid_width": "Grid Width (px/cell) (A/D)",
        "label_grid_height": "Grid Height (px/cell) (W/S)",
        "label_offset_x": "X Offset (px) (Ctrl ←/→)",
        "label_offset_y": "Y Offset (px) (Ctrl ↑/↓)",
        "label_high_precision": "High Precision",
        "btn_select_grid": "Select Grid",
        
        "label_zoom": "Zoom Level",
        "label_detect_method": "Detection Method",
        "method_dominant": "Dominant Color",
        "method_average": "Average Color",
        "label_merge_threshold": "Merge Threshold",
        "btn_merge_colors": "Merge Colors",
        "btn_compare": "Compare Original",
        "btn_show_original": "Show Original",
        "btn_show_blueprint": "Show Blueprint",
        "btn_gen_and_edit": "Generate & Edit",
        
        "tab_used_colors": "Used Colors",
        "tab_all_colors": "All Colors",
        "tab_stats": "Statistics",
        "msg_no_used_colors": "No colors used yet",
        "msg_no_stats": "No statistics available",
        "label_color_code": "None",
        
        "msg_pick_color": "Click canvas to pick",
        "label_closest_color": "Closest Colors",
        "msg_click_to_identify": "Click canvas to identify color",
        
        "btn_upload": "Upload Image",
        "btn_generate": "Generate",
        "btn_select_colors": "Select Colors",
        "btn_send_to_edit": "Send to Editor",
        
        "tool_pan": "Pan",
        "tool_brush": "Brush",
        "tool_bucket": "Bucket",
        "tool_replace": "Replace",
        "tool_eraser": "Eraser",
        "tool_eyedropper": "Eyedropper",
        "tool_remove_bg": "Remove BG",
        "tool_undo": "Undo",
        "tool_redo": "Redo",
        "tool_export": "Export",
        "tool_clear": "Clear",
        
        "welcome_title": "Upload Image to Start",
        "welcome_desc": "Supports JPG, PNG, GIF",
        "btn_select_image": "Select Image",
        
        "info_canvas_size": "Canvas Size",
        "info_color_count": "Colors",
        
        "modal_select_colors_title": "Select Owned Colors",
        "label_color_system": "System",
        "text_selected": "Selected",
        "text_total": "Total",
        "btn_select_all": "Select All",
        "btn_deselect_all": "Deselect All",
        "text_series": "Series",
        "btn_group_select_all": "Select Group",
        "btn_group_deselect_all": "Deselect Group",
        
        "modal_export_title": "Download Settings",
        "label_show_grid": "Show Grid Lines",
        "label_line_interval": "Line Interval",
        "label_line_color": "Line Color",
        "label_show_coords": "Show Coordinates",
        "label_coord_interval": "Coord Interval",
        "label_hide_codes": "Hide Color Codes",
        "label_include_stats": "Include Statistics",
        "btn_copy_clipboard": "Copy to Clipboard",
        "btn_download": "Download Blueprint",
        
        "msg_generate_first": "Please generate blueprint first",
        "msg_bg_not_detected": "Preset background color (T1/H1) not detected at edges",
        "msg_bg_removed": "Removed {count} background cells",
        "msg_bg_not_found": "No removable background area found",
        "msg_upload_first": "Please upload an image first",
        "msg_img_too_small": "Image is small, consider scaling up for better results",
        "msg_select_color_first": "Please select a color first",
        "msg_create_pattern_first": "Please create or edit a pattern first",
        "msg_clipboard_unsupported": "Clipboard copy not supported in this browser",
        "msg_copied": "Copied to clipboard",
        "msg_copy_failed": "Copy failed, please check permissions",
        "msg_confirm_clear": "Are you sure you want to clear the canvas?",
        "text_color_stats": "Color Statistics",
        "text_custom": "Custom",
        "msg_no_match_color": "No matching color found",
        "btn_lock_ratio": "Lock Aspect Ratio"
    },
    "zh-TW": {
        "app_title": "拼豆圖紙工坊",
        "tab_generation": "圖紙生成",
        "tab_editing": "圖紙編輯",
        "tab_identify": "顏色識別",
        "toolbar_tools": "工具",
        "toolbar_theme": "切換主題",
        
        "section_image_process": "圖片處理",
        "section_grid_settings": "網格設定",
        "section_view_process": "視圖與處理",
        "section_palette": "調色盤",
        "section_identify_result": "顏色識別結果",
        
        "btn_rotate_left": "向左旋轉",
        "btn_rotate_right": "向右旋轉",
        "btn_crop": "裁剪",
        "btn_contrast": "對比度",
        "btn_resize": "縮放",
        "btn_undo_image": "復原",
        "btn_confirm_crop": "確認裁剪",
        "btn_cancel": "取消",
        "label_scale_ratio": "縮放比例 (倍)",
        "label_target_width": "目標寬度 (px)",
        "label_target_height": "目標高度 (px)",
        "label_resize_algo": "縮放演算法",
        "algo_smooth": "平滑 (Bilinear)",
        "algo_pixelated": "像素化 (Nearest)",
        "btn_confirm": "確認",
        "label_contrast": "對比度",
        
        "label_grid_select_size": "框選網格大小 (NxN)",
        "label_grid_width": "網格寬度(px/格) (A/D)",
        "label_grid_height": "網格高度(px/格) (W/S)",
        "label_offset_x": "橫軸偏移(px) (Ctrl ←/→)",
        "label_offset_y": "縱軸偏移(px) (Ctrl ↑/↓)",
        "label_high_precision": "高精度偏移",
        "btn_select_grid": "框選網格",
        
        "label_zoom": "縮放比例",
        "label_detect_method": "識別方式",
        "method_dominant": "主導顏色",
        "method_average": "平均顏色",
        "label_merge_threshold": "顏色合併閾值",
        "btn_merge_colors": "顏色合併",
        "btn_compare": "對比原圖/圖紙",
        "btn_show_original": "顯示原圖",
        "btn_show_blueprint": "顯示圖紙",
        "btn_gen_and_edit": "生成並編輯",
        
        "tab_used_colors": "使用的顏色",
        "tab_all_colors": "全部顏色",
        "tab_stats": "顏色統計",
        "msg_no_used_colors": "暫無使用的顏色",
        "msg_no_stats": "暫無統計數據",
        "label_color_code": "未選擇",
        
        "msg_pick_color": "點擊畫布取色",
        "label_closest_color": "最接近的顏色",
        "msg_click_to_identify": "點擊畫布任意位置識別顏色",
        
        "btn_upload": "上傳圖片",
        "btn_generate": "生成圖紙",
        "btn_select_colors": "選擇顏色",
        "btn_send_to_edit": "發送到編輯區",
        
        "tool_pan": "拖動",
        "tool_brush": "畫筆",
        "tool_bucket": "油漆桶",
        "tool_replace": "替換同色",
        "tool_eraser": "橡皮擦",
        "tool_eyedropper": "吸管",
        "tool_remove_bg": "移除背景",
        "tool_undo": "復原",
        "tool_redo": "重做",
        "tool_export": "匯出圖紙",
        "tool_clear": "清空畫布",
        
        "welcome_title": "上傳圖片開始創作",
        "welcome_desc": "支援 JPG、PNG、GIF 格式",
        "btn_select_image": "選擇圖片",
        
        "info_canvas_size": "畫布大小",
        "info_color_count": "顏色數",
        
        "modal_select_colors_title": "選擇擁有的顏色",
        "label_color_system": "色號系統",
        "text_selected": "已選",
        "text_total": "總計",
        "btn_select_all": "全選",
        "btn_deselect_all": "取消全選",
        
        "modal_export_title": "下載圖紙設定",
        "label_show_grid": "顯示網格線",
        "label_line_interval": "線條間隔",
        "label_line_color": "線條顏色",
        "label_show_coords": "顯示座標",
        "label_coord_interval": "座標分度",
        "label_hide_codes": "隱藏色號",
        "label_include_stats": "包含統計",
        "btn_copy_clipboard": "複製到剪貼簿",
        "btn_download": "下載圖紙",
        
        "msg_generate_first": "請先生成圖紙",
        "msg_bg_not_detected": "邊緣未檢測到預設背景色(T1/H1)",
        "msg_bg_removed": "已移除 {count} 個背景格子",
        "msg_bg_not_found": "未找到可移除的背景區域",
        "msg_upload_first": "請先上傳圖片",
        "msg_img_too_small": "圖片尺寸較小，建議放大以獲得更好效果",
        "msg_select_color_first": "請先選擇一個顏色",
        "msg_create_pattern_first": "請先創建或編輯圖案",
        "msg_clipboard_unsupported": "當前瀏覽器不支持複製圖片到剪貼簿",
        "msg_copied": "已複製到剪貼簿",
        "msg_copy_failed": "複製失敗，請檢查權限",
        "msg_confirm_clear": "確定要清空畫布嗎？",
        "text_color_stats": "顏色統計",
        "text_custom": "自定義",
        "msg_no_match_color": "沒有找到匹配的顏色",
        "btn_lock_ratio": "鎖定寬高比例"
    },
    "zh-HK": {
        "app_title": "拼豆圖紙工坊",
        "tab_generation": "圖紙生成",
        "tab_editing": "圖紙編輯",
        "tab_identify": "顏色識別",
        "toolbar_tools": "工具",
        "toolbar_theme": "切換主題",
        
        "section_image_process": "圖片處理",
        "section_grid_settings": "網格設定",
        "section_view_process": "視圖與處理",
        "section_palette": "調色板",
        "section_identify_result": "顏色識別結果",
        
        "btn_rotate_left": "向左旋轉",
        "btn_rotate_right": "向右旋轉",
        "btn_crop": "裁剪",
        "btn_contrast": "對比度",
        "btn_resize": "縮放",
        "btn_undo_image": "復原",
        "btn_confirm_crop": "確認裁剪",
        "btn_cancel": "取消",
        "label_scale_ratio": "縮放比例 (倍)",
        "label_target_width": "目標寬度 (px)",
        "label_target_height": "目標高度 (px)",
        "label_resize_algo": "縮放演算法",
        "algo_smooth": "平滑 (Bilinear)",
        "algo_pixelated": "像素化 (Nearest)",
        "btn_confirm": "確認",
        "label_contrast": "對比度",
        
        "label_grid_select_size": "框選網格大小 (NxN)",
        "label_grid_width": "網格寬度(px/格) (A/D)",
        "label_grid_height": "網格高度(px/格) (W/S)",
        "label_offset_x": "橫軸偏移(px) (Ctrl ←/→)",
        "label_offset_y": "縱軸偏移(px) (Ctrl ↑/↓)",
        "label_high_precision": "高精度偏移",
        "btn_select_grid": "框選網格",
        
        "label_zoom": "縮放比例",
        "label_detect_method": "識別方式",
        "method_dominant": "主導顏色",
        "method_average": "平均顏色",
        "label_merge_threshold": "顏色合併閾值",
        "btn_merge_colors": "顏色合併",
        "btn_compare": "對比原圖/圖紙",
        "btn_show_original": "顯示原圖",
        "btn_show_blueprint": "顯示圖紙",
        "btn_gen_and_edit": "生成並編輯",
        
        "tab_used_colors": "使用的顏色",
        "tab_all_colors": "全部顏色",
        "tab_stats": "顏色統計",
        "msg_no_used_colors": "暫無使用的顏色",
        "msg_no_stats": "暫無統計數據",
        "label_color_code": "未選擇",
        
        "msg_pick_color": "點擊畫布取色",
        "label_closest_color": "最接近的顏色",
        "msg_click_to_identify": "點擊畫布任意位置識別顏色",
        
        "btn_upload": "上傳圖片",
        "btn_generate": "生成圖紙",
        "btn_select_colors": "選擇顏色",
        "btn_send_to_edit": "發送到編輯區",
        
        "tool_pan": "拖動",
        "tool_brush": "畫筆",
        "tool_bucket": "油漆桶",
        "tool_replace": "替換同色",
        "tool_eraser": "擦膠",
        "tool_eyedropper": "吸管",
        "tool_remove_bg": "移除背景",
        "tool_undo": "復原",
        "tool_redo": "重做",
        "tool_export": "匯出圖紙",
        "tool_clear": "清空畫布",
        
        "welcome_title": "上傳圖片開始創作",
        "welcome_desc": "支援 JPG、PNG、GIF 格式",
        "btn_select_image": "選擇圖片",
        
        "info_canvas_size": "畫布大小",
        "info_color_count": "顏色數",
        
        "modal_select_colors_title": "選擇擁有的顏色",
        "label_color_system": "色號系統",
        "text_selected": "已選",
        "text_total": "總計",
        "btn_select_all": "全選",
        "btn_deselect_all": "取消全選",
        
        "modal_export_title": "下載圖紙設定",
        "label_show_grid": "顯示網格線",
        "label_line_interval": "線條間隔",
        "label_line_color": "線條顏色",
        "label_show_coords": "顯示坐標",
        "label_coord_interval": "座標分度",
        "label_hide_codes": "隱藏色號",
        "label_include_stats": "包含統計",
        "btn_copy_clipboard": "複製到剪貼簿",
        "btn_download": "下載圖紙"
    },
    "ja": {
        "app_title": "アイロンビーズ図案作成",
        "tab_generation": "図案生成",
        "tab_editing": "図案編集",
        "tab_identify": "色識別",
        "toolbar_tools": "ツール",
        "toolbar_theme": "テーマ切替",
        
        "section_image_process": "画像処理",
        "section_grid_settings": "グリッド設定",
        "section_view_process": "表示と処理",
        "section_palette": "パレット",
        "section_identify_result": "色識別結果",
        
        "btn_rotate_left": "左回転",
        "btn_rotate_right": "右回転",
        "btn_crop": "トリミング",
        "btn_contrast": "コントラスト",
        "btn_resize": "リサイズ",
        "btn_undo_image": "元に戻す",
        "btn_confirm_crop": "トリミング確定",
        "btn_cancel": "キャンセル",
        "label_scale_ratio": "ズーム倍率 (倍)",
        "label_target_width": "目標幅 (px)",
        "label_target_height": "目標高さ (px)",
        "label_resize_algo": "アルゴリズム",
        "algo_smooth": "滑らか (Bilinear)",
        "algo_pixelated": "ドット化 (Nearest)",
        "btn_confirm": "確認",
        "label_contrast": "コントラスト",
        
        "label_grid_select_size": "選択グリッドサイズ (NxN)",
        "label_grid_width": "グリッド幅(px/マス) (A/D)",
        "label_grid_height": "グリッド高さ(px/マス) (W/S)",
        "label_offset_x": "Xオフセット(px) (Ctrl ←/→)",
        "label_offset_y": "Yオフセット(px) (Ctrl ↑/↓)",
        "label_high_precision": "高精度オフセット",
        "btn_select_grid": "グリッド選択",
        
        "label_zoom": "ズーム倍率",
        "label_detect_method": "識別方法",
        "method_dominant": "ドミナントカラー",
        "method_average": "平均色",
        "label_merge_threshold": "色統合しきい値",
        "btn_merge_colors": "色を統合",
        "btn_compare": "元画像/図案比較",
        "btn_show_original": "元画像を表示",
        "btn_show_blueprint": "図案を表示",
        "btn_gen_and_edit": "生成して編集",
        
        "tab_used_colors": "使用色",
        "tab_all_colors": "全色",
        "tab_stats": "色統計",
        "msg_no_used_colors": "使用色なし",
        "msg_no_stats": "統計データなし",
        "label_color_code": "未選択",
        
        "msg_pick_color": "キャンバスをクリックして色を取得",
        "label_closest_color": "近似色",
        "msg_click_to_identify": "キャンバスをクリックして色を識別",
        
        "btn_upload": "画像アップロード",
        "btn_generate": "図案生成",
        "btn_select_colors": "色選択",
        "btn_send_to_edit": "編集エリアへ送る",
        
        "tool_pan": "パン",
        "tool_brush": "ブラシ",
        "tool_bucket": "バケツ",
        "tool_replace": "同色置換",
        "tool_eraser": "消しゴム",
        "tool_eyedropper": "スポイト",
        "tool_remove_bg": "背景削除",
        "tool_undo": "元に戻す",
        "tool_redo": "やり直し",
        "tool_export": "図案エクスポート",
        "tool_clear": "キャンバスをクリア",
        
        "welcome_title": "画像をアップロードして開始",
        "welcome_desc": "JPG, PNG, GIF 対応",
        "btn_select_image": "画像を選択",
        
        "info_canvas_size": "キャンバスサイズ",
        "info_color_count": "色数",
        
        "modal_select_colors_title": "所持色を選択",
        "label_color_system": "色番号システム",
        "text_selected": "選択済み",
        "text_total": "合計",
        "btn_select_all": "すべて選択",
        "btn_deselect_all": "選択解除",
        "text_series": "シリーズ",
        "btn_group_select_all": "グループ全選択",
        "btn_group_deselect_all": "グループ選択解除",
        
        "modal_export_title": "ダウンロード設定",
        "label_show_grid": "グリッド線を表示",
        "label_line_interval": "線の間隔",
        "label_line_color": "線の色",
        "label_show_coords": "座標を表示",
        "label_coord_interval": "座標間隔",
        "label_hide_codes": "色番号を隠す",
        "label_include_stats": "統計を含める",
        "btn_copy_clipboard": "クリップボードにコピー",
        "btn_download": "図案をダウンロード",
        
        "msg_generate_first": "先に図案を生成してください",
        "msg_bg_not_detected": "縁に背景色(T1/H1)が検出されませんでした",
        "msg_bg_removed": "{count} 個の背景マスを削除しました",
        "msg_bg_not_found": "削除可能な背景エリアが見つかりません",
        "msg_upload_first": "先に画像をアップロードしてください",
        "msg_img_too_small": "画像サイズが小さいです。拡大するとより良い結果が得られます",
        "msg_select_color_first": "先に色を選択してください",
        "msg_create_pattern_first": "先に図案を作成または編集してください",
        "msg_clipboard_unsupported": "お使いのブラウザは画像のクリップボードコピーをサポートしていません",
        "msg_copied": "クリップボードにコピーしました",
        "msg_copy_failed": "コピーに失敗しました。権限を確認してください",
        "msg_confirm_clear": "キャンバスをクリアしてもよろしいですか？",
        "text_color_stats": "色統計",
        "text_custom": "カスタム",
        "msg_no_match_color": "一致する色が見つかりません",
        "btn_lock_ratio": "縦横比を固定"
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('app_language') || 'zh-CN';
        this.translations = translations;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('app_language', lang);
            this.updatePage();
            return true;
        }
        return false;
    }

    t(key, params = {}) {
        let text = this.translations[this.currentLang][key] || key;
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    }

    updatePage() {
        // 更新带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                // 如果是 input 类型的按钮或占位符
                if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                    el.value = this.t(key);
                } else if (el.hasAttribute('placeholder')) {
                    el.placeholder = this.t(key);
                } else {
                    // 对于普通元素，只替换文本内容，保留子元素（如图标）
                    // 这是一个简化的处理，对于复杂的嵌套结构可能需要更精细的处理
                    // 这里我们假设 data-i18n 元素主要包含文本，或者我们将文本包裹在 span 中
                    
                    // 检查是否有子元素
                    if (el.children.length > 0) {
                        // 尝试找到专门用于显示文本的子元素，或者寻找文本节点替换
                        // 这里的策略是：如果有 data-i18n-target，则替换该目标
                        // 否则，遍历子节点，替换文本节点
                        let textNodeFound = false;
                        for (let node of el.childNodes) {
                            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                                node.textContent = this.t(key);
                                textNodeFound = true;
                                break; // 只替换第一个非空文本节点
                            }
                        }
                        // 如果没有找到文本节点（可能是纯图标按钮），则添加 title 属性
                        if (!textNodeFound) {
                            el.title = this.t(key);
                        }
                    } else {
                        el.textContent = this.t(key);
                    }
                }
            }
        });
        
        // 更新带有 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });

        // 更新 HTML title
        document.title = this.t('app_title');

        // 更新 HTML lang 属性
        document.documentElement.lang = this.currentLang;
        
        // 触发自定义事件，通知其他组件语言已更改
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    }
}

// 初始化全局 i18n 实例
const i18n = new I18n();
