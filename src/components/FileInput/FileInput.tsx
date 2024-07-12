import React, { useRef, useState } from "react";
import styles from "./fileinput.module.scss";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";

interface FileInputProps {
	multiple?: boolean;
	setFiles: React.Dispatch<React.SetStateAction<FileElement[]>>;
	disabled?: boolean;
}

export interface FileElement {
	file: File;
	url: string;
}

const acceptedFormat = ["image/png", "image/jpg", "image/jpeg"];
const LIMIT = 50;

const FileInput = ({ multiple, setFiles, disabled }: FileInputProps) => {
	const isMultipleAllowedRef = useRef(multiple ? true : false);
	const dragAreaRef = useRef<HTMLDivElement | null>(null);

	const [previewURL, setPreviewURL] = useState<string[]>([]);

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

		const data = e.dataTransfer;
		const files = data.files;

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
			{previewURL.length > 0 && (
				<div className={styles.preview}>
					{previewURL.map((url) => {
						return <img key={url} src={url} alt="" />;
					})}
				</div>
			)}

			<div className={styles.input}>
				<input
					type="file"
					accept=".jpg, .jpeg, .png"
					required
					onChange={handleFileChange}
					id="user-file-input"
					multiple={isMultipleAllowedRef.current}
					disabled={disabled}
				/>

				{previewURL.length > 0 && (
					<span>File Selected: {previewURL.length}</span>
				)}

				<span>
					<label htmlFor="user-file-input">Choose a file</label> or{" "}
					<FontAwesomeIcon icon={faImage} /> drag and drop here
				</span>
			</div>
		</div>
	);
};

export default FileInput;
