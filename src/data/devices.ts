// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	Huawei: [
		{
			name: "Huawei P60 Pro",
			image: "/images/device/huawei-p60-pro.webp",
			specs: "洛可可白 / 8GB + 256GB",
			description: "超感知徕卡三摄,昆仑玻璃,66W超级快充。",
			link: "https://consumer.huawei.com/cn/phones/p60-pro/",
		},
		{
			name: "Huawei MatePad 12.2-inch 2024",
			image: "/images/device/huawei-matepad-122-2024.webp",
			specs: "WiFi / 8GB + 256GB",
			description: "12.2英寸全面屏,鸿蒙OS,多屏协同。",
			link: "https://consumer.huawei.com/cn/tablets/matepad-pro-12-2-2024/",
		},
	],
	Lenovo: [
		{
			name: "Lenovo ThinkBook 16 G6+ IMH",
			image: "/images/device/lenovo-thinkbook-16-2024.webp",
			specs: "Utral 5 125H / 32GB + 1TB",
			description: "16英寸2.5K高刷屏，高性能商务本。",
			link: "https://www.lenovo.com/cn/zh/laptops/thinkbook/thinkbook-16-plus-series/",
		},
	],
	Router: [
		{
			name: "Huawei Router Q6 (WS7290 v2)",
			image: "/images/device/huawei-q6.webp",
			specs: "WiFi 6+ / 2.5G",
			description: "华为分布式路由器，支持Mesh组网，覆盖更广。",
			link: "https://consumer.huawei.com/cn/routers/q6/",
		},
	],
};
