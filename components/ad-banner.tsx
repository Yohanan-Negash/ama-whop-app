"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AdBanner() {
	const [isVisible, setIsVisible] = useState(true);
	if (!isVisible) return null;
	return (
		<div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1 max-w-xs relative">
			<div className="w-7 h-7 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-600 text-sm">
				AD
			</div>
			<div className="flex flex-col justify-center">
				<span className="text-xs font-semibold text-orange-700 leading-tight">
					Anonymous AMA App
				</span>
				<span className="text-[10px] text-gray-500 leading-tight">
					Get anonymous questions from your community
				</span>
			</div>
			<button
				type="button"
				className="ml-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-medium whitespace-nowrap"
				onClick={() =>
					window.open(
						"https://whop.com/apps/app_lAgURr4dDAesot/install/",
						"_blank",
					)
				}
			>
				Install Now
			</button>
			<button
				type="button"
				aria-label="Close ad"
				className="absolute top-1 right-1 p-1 rounded hover:bg-orange-100 text-gray-400 hover:text-gray-600"
				onClick={() => setIsVisible(false)}
			>
				<X className="h-3 w-3" />
			</button>
		</div>
	);
}
