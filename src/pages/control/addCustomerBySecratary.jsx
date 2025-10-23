import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function AddCustomerBySecratary() {

    const navigate = useNavigate();
	const [customerId, setCustomerId] = useState("");
    const [title, setTitle] = useState("");
	const [name, setName] = useState("");
	const [nameSinhala, setNameSinhala] = useState("");
	const [address, setAddress] = useState("");
	const [memberRole, setMemberRole] = useState("");
	const [notes, setNotes] = useState("");
	const [image, setImage] = useState([]);
	const [mobile, setMobile] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [familyMembers, setFamilyMembers] = useState([{ name: "", relationship: "" }]);

    const [isAdding, setIsAdding] = useState(false);

	const handleAddProduct = async () => {
		const token = localStorage.getItem("token");
		if (!token) return toast.error("Please log in first.");

		if (!name || !mobile || !memberRole) {
			toast.error("Please fill in name, mobile number and member role");
			setIsAdding(false);
			return;
		}

		const invalidFamilyMember = familyMembers.some(
			m => !m.name || !m.relationship
		);
		if (invalidFamilyMember) {
			toast.error("Please fill all family member fields");
			setIsAdding(false);
			return;
		}

		try {
			// Upload images if any
			let uploadedImages = [];
			if (image.length > 0) {
				uploadedImages = await Promise.all(image.map(img => mediaUpload(img)));
			}

			// Default image if none uploaded
			const finalImages = uploadedImages.length === 0 ? ["/userDefault.jpg"] : uploadedImages;

			const newCustomer = {
				customerId,
				title,
				name,
				nameSinhala,
				memberRole: memberRole || 'member',  // ensure default
				address: address ? address.split(",").map(n => n.trim()) : [],
				notes: notes || "",
				image: finalImages,
				mobile,
				phone: phone || undefined,
				familyMembers,
			};

			if (email) newCustomer.email = email;  // only include if non-empty

			await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/customer`, newCustomer, {
				headers: { Authorization: `Bearer ${token}` },
			});

			toast.success("Member added successfully!");
			navigate(-1);

		} catch (err) {
			toast.error(err?.response?.data?.message || "Something went wrong");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="w-full h-full flex flex-col p-4">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
			<div>
				<h1 className="text-lg md:text-xl font-semibold text-gray-800">
				🛒 Add New Member By Sec
				</h1>
				<p className="text-sm text-gray-500">Fill the member details to add it</p>
			</div>

			{/* Buttons */}
			<div className="flex justify-end gap-3">
				<button
				disabled={isAdding}
				onClick={async () => {
					setIsAdding(true);
					await handleAddProduct();
				}}
				className={`px-4 md:px-6 py-2 rounded-lg text-sm font-medium shadow-md transition duration-300 text-white ${
					isAdding
					? "bg-gray-500 cursor-not-allowed"
					: "bg-green-600 hover:bg-green-700"
				}`}
				>
				{isAdding ? "Adding..." : "Add Member"}
				</button>

				<Link
				to="/admin"
				className="bg-red-500 hover:bg-red-600 text-white px-6 md:px-8 py-2 rounded-md text-sm font-medium shadow"
				>
				Cancel
				</Link>
			</div>
			</div>

			{/* Form Container */}
			<div className="w-full h-full p-4 md:px-10 md:py-6 shadow rounded-xl border border-gray-200 flex flex-col">
			{/* Form Split into Columns */}
			<div className="flex flex-col lg:flex-row justify-between gap-8">
				{/* Left Column */}
				<div className="w-full lg:w-1/2 space-y-4">
				{/* Number / Title / Name */}
				<div className="w-full flex flex-col sm:flex-row sm:items-end gap-3">
					<div className="w-full sm:w-1/4">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Number
					</label>
					<input
						type="text"
						placeholder="e.g. 001"
						value={customerId}
						onChange={(e) => {
						const value = e.target.value.replace(/\D/g, "").slice(0, 3);
						setCustomerId(value);
						}}
						maxLength={3}
						className="w-full p-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					</div>

					<div className="w-full sm:w-1/4">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Title
					</label>
					<select
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Select</option>
						<option value="Mr.">Mr.</option>
						<option value="Mrs.">Mrs.</option>
						<option value="Miss.">Miss.</option>
					</select>
					</div>

					<div className="w-full sm:w-1/2">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Member Name (English)
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="e.g. Sunil Gunarathne"
					/>
					</div>
				</div>

				{/* Member Role & Sinhala Name */}
				<div className="w-full flex flex-col sm:flex-row gap-3">
					<div className="w-full sm:w-1/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Member Role
					</label>
					<select
						value={memberRole}
						onChange={(e) => setMemberRole(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Select</option>
						<option value="member">Member</option>
						{/* <option value="chairman">Chairman</option>
						<option value="secretary">Secretary</option>
						<option value="treasurer">Treasurer</option>
						<option value="manager">Manager</option>
						<option value="executive">Executive</option>
						<option value="admin">Admin</option> */}
					</select>
					</div>

					<div className="w-full sm:w-2/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Name (Sinhala)
					</label>
					<input
						type="text"
						value={nameSinhala}
						onChange={(e) => setNameSinhala(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="e.g. සුනිල් ගුණරත්න"
					/>
					</div>
				</div>

				{/* Family Members */}
				<div className="space-y-3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Family Members
					</label>

					{familyMembers.map((member, index) => (
					<div
						key={index}
						className="flex flex-col sm:flex-row gap-3 items-center"
					>
						<input
						type="text"
						placeholder="Name"
						value={member.name}
						onChange={(e) => {
							const updated = [...familyMembers];
							updated[index].name = e.target.value;
							setFamilyMembers(updated);
						}}
						className="w-full sm:w-2/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
						/>

						<div className="flex w-full sm:w-1/3 gap-2">
						<select
							value={member.relationship}
							onChange={(e) => {
							const updated = [...familyMembers];
							updated[index].relationship = e.target.value;
							setFamilyMembers(updated);
							}}
							className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">Select Relationship</option>
							<option value="mother">Mother</option>
							<option value="father">Father</option>
							<option value="son">Son</option>
							<option value="daughter">Daughter</option>
							<option value="wife">Wife</option>
							<option value="husband">Husband</option>
							<option value="other">Other</option>
						</select>

						<button
							type="button"
							onClick={() =>
							setFamilyMembers(familyMembers.filter((_, i) => i !== index))
							}
							className="text-red-600 hover:text-red-800 font-semibold"
						>
							✕
						</button>
						</div>
					</div>
					))}

					<button
					type="button"
					onClick={() =>
						setFamilyMembers([...familyMembers, { name: "", relationship: "" }])
					}
					className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
					>
					+ Add Family Member
					</button>
				</div>
				</div>

				{/* Right Column */}
				<div className="w-full lg:w-[45%] space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Address (comma-separated)
					</label>
					<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="e.g. 123 Main Street, Colombo"
					/>
				</div>

				{/* Contact Info */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="w-full sm:w-1/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Mobile Number
					</label>
					<input
						type="text"
						value={mobile}
						onChange={(e) => setMobile(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						placeholder="07xxxxxxxx"
					/>
					</div>

					<div className="w-full sm:w-1/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Phone Number
					</label>
					<input
						type="text"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						placeholder="011xxxxxxx"
					/>
					</div>

					<div className="w-full sm:w-1/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						placeholder="example@email.com"
					/>
					</div>
				</div>

				{/* Notes */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Description
					</label>
					<textarea
					rows="3"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Additional notes..."
					></textarea>
				</div>

				{/* Image Preview */}
				<div>
					<p className="text-sm text-gray-700 font-medium mb-1">
					Selected Images
					</p>
					<div className="w-full h-40 overflow-y-auto border border-gray-300 rounded-md shadow-inner p-2">
					{image.length > 0 && (
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{image.map((file, index) => (
							<div
							key={index}
							className="relative border rounded-md overflow-hidden group"
							>
							<img
								src={URL.createObjectURL(file)}
								alt={`new-${index}`}
								className="w-full h-24 object-cover"
							/>
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
					)}
					</div>
				</div>

				{/* Upload Input */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Upload Images
					</label>
					<input
					type="file"
					multiple
					onChange={(e) => setImage(Array.from(e.target.files))}
					className="w-full text-sm text-blue-500 cursor-pointer hover:text-blue-700"
					/>
				</div>
				</div>
			</div>
			</div>
		</div>
	);
}