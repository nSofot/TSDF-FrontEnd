import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function EditCustomerPage() {
	const location = useLocation();
	const navigate = useNavigate();

	const [customerId, setCustomerId] = useState("");
	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [notes, setNotes] = useState("");
	const [image, setImage] = useState([]);
	const [mobile, setMobile] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");

	const [existingImages, setExistingImages] = useState([]);

	const token = localStorage.getItem("token");

	useEffect(() => {
		if (location.state) {
			const data = location.state;
			setCustomerId(data.customerId || "");
			setName(data.name || "");
			// setAddress(Array.isArray(data.address) ? data.address.join(",") : "");
			setAddress(data.address || ""); 
			setNotes(data.notes || "");
			setMobile(data.mobile || "");
			setPhone(data.phone || "");
			setEmail(data.email || "");
			// setExistingImages(data.image || []);
		}
	}, [location.state]);


	async function updateProduct() {
		const token = localStorage.getItem("token");
		if (!token) {
			toast.error("Please login first");
			return;
		}

		try {
			let uploadedNewImages = [];

			if (image.length > 0) {
				const uploadPromises = image.map((img) => mediaUpload(img));
				uploadedNewImages = await Promise.all(uploadPromises);
			}

			const updatedProduct = {
				customerId,
				name,
				// altNames: altNames.split(",").map((n) => n.trim()),
				address,
				notes,
				image: [...existingImages, ...uploadedNewImages],
				mobile,
				phone,
				email
			};

			await axios.put(
			`${import.meta.env.VITE_BACKEND_URL}/api/customer/${customerId}`,
			updatedProduct,
			{
				headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				},
			}
			);


			toast.success("Member updated successfully");
			navigate(-1);
		} catch (error) {
			console.error(error);
			toast.error(error?.response?.data?.message || "Update failed");
		}
	}

	return (

		<div className="w-full h-full flex flex-col p-4">
			<div className="flex justify-between items-center mb-4">
				<div>
					<h1 className="text-xl font-semibold text-gray-800">✏️ Edit Member</h1>
					<p className="text-sm text-gray-500">Update existing member information</p>
				</div>
				{/* Update Button */}
				<div className="flex justify-end gap-6">
					<button
					onClick={updateProduct}
					className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md transition duration-300"
					>
					Update Member
					</button>
					<Link
						to="/admin/products"
						className="bg-red-500 hover:bg-red-600 text-white px-10 py-2 rounded-md text-sm font-medium shadow"
					>
						Cancel
					</Link>
				</div>
			</div>

			<div className="bg-white w-full h-full px-10 py-6 shadow rounded-xl border border-gray-200 flex flex-col">

				<div className=" flex justify-between">				
					{/* Left Column */}
					<div className="w-[55%] h-full space-y-10">

						<div className="w-full flex justify-between">
							{/* Product ID */}
							<div className="w-[20%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
								<input
									type="text"
									disabled
									value={customerId}
									className="w-full p-2 bg-gray-100 text-sm border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
								/>
							</div>

							{/* Product Name */}
							<div className="w-[75%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. Apple iPhone 15"
								/>
							</div>
						</div>

						{/* Alt Names */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Address (comma-separated)</label>
							<input
								type="text"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="e.g. iPhone, iPhone 15"
							/>
						</div>

						<div className="w-full flex justify-between">
							{/* Labelled Price */}
							<div className="w-[25%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
								<input
									type="text"
									value={mobile}
									onChange={(e) => setMobile(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. 999.99"
								/>
							</div>

							{/* Selling Price */}
							<div className="w-[25%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
								<input
									type="text"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. 899.99"
								/>
							</div>

							{/* Stock */}
							<div className="w-[45%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
								<input
									type="text"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. 150"
								/>
							</div>
						</div>
						{/* Description */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
							<textarea
							rows="3"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Write a detailed description of the product..."
							></textarea>
						</div>
					</div>


					{/* Right Column */}
					<div className="w-[40%] h-full rounded-lg flex flex-col justify-between">
						{/* Existing Images */}
						<p className="text-sm text-gray-700 font-medium mb-1">Existing Images</p>
						<div className="w-full h-80 overflow-y-auto bg-white rounded-md shadow-inner">
						{existingImages.length > 0 && (
							<div className="space-y-2">
								<div className="grid grid-cols-3 gap-3">
									{/* Existing Images */}
									{existingImages.map((imgUrl, index) => (
									<div key={`existing-${index}`} className="relative border rounded-md overflow-hidden group">
										<img src={imgUrl} alt={`existing-${index}`} className="w-full h-20 object-cover" />
										<button
										type="button"
										onClick={() => {
											const filtered = existingImages.filter((_, i) => i !== index);
											setExistingImages(filtered);
										}}
										className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full px-2 py-0.5 hover:bg-red-600"
										>
										✕
										</button>
									</div>
									))}

									{/* New Images */}
									{image.map((file, index) => (
									<div key={`new-${index}`} className="relative border rounded-md overflow-hidden group">
										<img src={URL.createObjectURL(file)} alt={`new-${index}`} className="w-full h-20 object-cover" />
										<button
										type="button"
										onClick={() => {
											const filtered = image.filter((_, i) => i !== index);
											setImage(filtered);
										}}
										className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full px-2 py-0.5 hover:bg-red-600"
										>
										✕
										</button>
									</div>
									))}
								</div>
							</div>
						)}
						</div>


						{/* Image Upload */}
						<div className="mt-8">
							<label className="block text-sm font-medium text-gray-700 mb-1">Add New Images (optional)</label>
							<input
							type="file"
							multiple
							onChange={(e) => setImage(Array.from(e.target.files))}
							className="w-full text-sm text-blue-500 font-italic file-input file-input-bordered rounded-lg cursor-pointer hover:text-blue-800"
							/>
						</div>
					</div>
				</div>
			</div> 
		</div>
	);
}
