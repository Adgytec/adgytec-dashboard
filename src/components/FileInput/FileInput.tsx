import React, { useEffect, useRef, useState } from "react";
import styles from "./fileinput.module.scss";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import Image from "next/image";

interface FileInputProps {
	multiple?: boolean;
	setFiles: React.Dispatch<React.SetStateAction<FileElement[]>>;
	disabled?: boolean;
	image?: File | null;
	files: FileElement[];
	id?: string;
}

export interface FileElement {
	file: File;
	url: string;
}

const acceptedFormat = [
	"image/png",
	"image/jpg",
	"image/jpeg",
	"image/webp",
	"image/svg+xml",
	"image/gif",
];
const LIMIT = 50;

const FileInput = ({
	multiple,
	setFiles,
	disabled,
	image,
	files,
	id,
}: FileInputProps) => {
	const isMultipleAllowedRef = useRef(multiple ? true : false);
	const dragAreaRef = useRef<HTMLDivElement | null>(null);

	const [previewURL, setPreviewURL] = useState<string[]>([]);

	useEffect(() => {
		if (image) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(image);

			const fileList = dataTransfer.files;
			handleFiles(fileList);
		}
	}, [image]);

	const handleFiles = (inputFiles: FileList) => {
		let files: FileElement[] = [];
		let urls: string[] = [];

		if (!isMultipleAllowedRef.current) {
			const file = inputFiles[0];
			const type = file.type;

			if (!acceptedFormat.includes(type)) {
				addClass("error");

				setTimeout(() => {
					removeClass("error");
				}, 1000);
				toast.error("Unsupported media file added");
				return;
			}

			const url = URL.createObjectURL(file);
			urls.push(url);
			files.push({
				file,
				url,
			});
		} else {
			let allUnsupported = true;
			let ind = 0;

			for (const file of inputFiles) {
				if (ind >= LIMIT) break;

				const type = file.type;

				if (!acceptedFormat.includes(type)) {
					continue;
				}

				allUnsupported = false;
				const url = URL.createObjectURL(file);
				urls.push(url);
				files.push({
					file,
					url,
				});
				ind++;
			}

			if (allUnsupported) {
				addClass("error");
				setTimeout(() => {
					removeClass("error");
				}, 1000);
				toast.error("Unsupported media files added");
				return;
			}
		}

		setFiles(files);
		setPreviewURL(urls);
	};

	const addClass = (variant: string) => {
		switch (variant) {
			case "active":
				dragAreaRef.current?.classList.add(styles.active);
				return;
			case "error":
				dragAreaRef.current?.classList.add(styles.error);
				return;
		}
	};

	const removeClass = (variant: string) => {
		switch (variant) {
			case "active":
				dragAreaRef.current?.classList.remove(styles.active);
				return;
			case "error":
				dragAreaRef.current?.classList.remove(styles.error);
				return;
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		handleFiles(files);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (disabled) return;

		removeClass("active");

		const dataTransfer = e.dataTransfer;
		const files = dataTransfer.files;

		if (files.length === 0) {
			return;
		}

		handleFiles(files);
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (disabled) return;

		addClass("active");
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (disabled) return;

		addClass("active");
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (disabled) return;

		removeClass("active");
	};

	return (
		<div
			className={styles.drop_area}
			onDrop={handleDrop}
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			ref={dragAreaRef}
		>
			{files.length > 0 && previewURL.length > 0 && (
				<div className={styles.preview}>
					{previewURL.map((url) => {
						return (
							<Image
								key={url}
								src={url}
								alt=""
								width={200}
								height={100}
							/>
						);
					})}
				</div>
			)}

			<div className={styles.input}>
				<input
					type="file"
					accept=".jpg, .jpeg, .png, .webp, .gif, .svg"
					// required
					onChange={handleFileChange}
					id={`user-file-input${id ? "-" + id : ""}`}
					multiple={isMultipleAllowedRef.current}
					disabled={disabled}
				/>

				{files.length > 0 && previewURL.length > 0 && (
					<span>File Selected: {previewURL.length}</span>
				)}

				<span>
					<label htmlFor={`user-file-input${id ? "-" + id : ""}`}>
						Choose a file
					</label>{" "}
					or <FontAwesomeIcon icon={faImage} /> drag and drop here
				</span>
			</div>
		</div>
	);
};

export default FileInput;
