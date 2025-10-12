import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function EditCustomerPage() {	
	const location = useLocation();
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
	const [isUpdating, setIsUpdating] = useState(false);

	const [existingImages, setExistingImages] = useState([]);

	const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    // if (!user) navigate("/");
    // if (user.memberRole !== 'secretary') navigate("/");

	useEffect(() => {
	if (location.state) {
		const data = location.state;
		setCustomerId(data.customerId || "");
		setTitle(data.title || "");
		setName(data.name || "");
		setNameSinhala(data.nameSinhala || "");
		setMemberRole(data.memberRole || "");
		setAddress(Array.isArray(data.address) ? data.address.join(", ") : data.address || "");
		setNotes(data.notes || "");
		setMobile(data.mobile || "");
		setPhone(data.phone || "");
		setEmail(data.email || "");
		setExistingImages(data.image || []);
		setFamilyMembers(data.familyMembers || [{ name: "", relationship: "" }]);
	}
	}, [location.state]);



	async function updateProduct() {
		setIsUpdating(true);

		// Validate basic fields
		if (!name || !mobile || !memberRole) {
			toast.error("Please fill in name, mobile number and member role");
			setIsUpdating(false);
			return;
		}

		// Validate family members
		const invalidFamilyMember = familyMembers.some(
			(member) => !member.name || !member.relationship
		);
		if (invalidFamilyMember) {
			toast.error("Please ensure all family members have both name and relationship");
			setIsUpdating(false);
			return;
		}

		try {
			let uploadedNewImages = [];

			if (image.length > 0) {
				const uploadPromises = image.map((img) => mediaUpload(img));
				uploadedNewImages = await Promise.all(uploadPromises);
			} else {
				uploadedNewImages =  ["/userDefault.jpg"];
			}

			const updatedProduct = {
				customerId,
				title,
				name,
				nameSinhala,
				memberRole,
				address: address.split(",").map((n) => n.trim()),
				notes,
				image: [...existingImages, ...uploadedNewImages],
				mobile,
				phone,
				email,
				familyMembers
			};

			await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/api/customer/update/${customerId}`,
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
		} finally {
			setIsUpdating(false);
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
						onClick={async () => {
							setIsUpdating(true);
							await updateProduct();
							setIsUpdating(false);
						}}
						className={`px-6 py-2 rounded-lg text-sm font-medium shadow-md transition duration-300 text-white ${
							isUpdating
							? "bg-gray-500 cursor-not-allowed" // while updating
							: "bg-blue-600 hover:bg-blue-700"  // normal state
						}`}
						disabled={isUpdating}
					>
						{isUpdating ? "Updating..." : "Update Member"}
					</button>


					<Link
						to="/admin"
						className="bg-red-500 hover:bg-red-600 text-white px-10 py-2 rounded-md text-sm font-medium shadow"
					>
						Cancel
					</Link>
				</div>
			</div>

			<div className="bg-white w-full h-full px-10 py-6 shadow rounded-xl border border-gray-200 flex flex-col">
				<div className="flex justify-between">				
					{/* Left Column */}
					<div className="w-[50%] h-full space-y-4">

						<div className="w-full flex justify-between">
							<div className="w-[15%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
								<input
									type="text"
									disabled
									value={customerId}
									className="w-full p-2 bg-gray-100 text-sm text-center border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
								/>
							</div>

							<div className="w-[15%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
								<select
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="Mr.">Mr.</option>
									<option value="Mrs.">Mrs.</option>
									<option value="Miss.">Miss.</option>
								</select>
							</div>

							<div className="w-[60%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Member Name (English)</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. Apple iPhone 15"
								/>
							</div>
						</div>

						<div className="w-full flex justify-between">
							<div className="w-[25%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Member Rolle</label>
								<select
									value={memberRole}
									onChange={(e) => setMemberRole(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="member">Member</option>
									<option value="chairman">Chairman</option>
									<option value="secretary">Secretary</option>
									<option value="treasurer">Treasurer</option>
									<option value="manager">Manager</option>									
									<option value="executive">Executive</option>
									<option value="admin">Admin</option>
								</select>
							</div>
							<div className="w-[70%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">Name (Sinhala)</label>
								<input
									type="text"
									value={nameSinhala}
									onChange={(e) => setNameSinhala(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. Apple iPhone 15"
								/>
							</div>							
						</div>

						<div className="w-full space-y-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">Family Members</label>

							{familyMembers.map((member, index) => (
								<div key={index} className="flex items-center gap-3">
								{/* Name Input */}
								<input
									type="text"
									placeholder="Name"
									value={member.name}
									onChange={(e) => {
									const updated = [...familyMembers];
									updated[index].name = e.target.value;
									setFamilyMembers(updated);
									}}
									className="w-2/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
								/>

								{/* Relationship Dropdown */}
								<select
									value={member.relationship}
									onChange={(e) => {
									const updated = [...familyMembers];
									updated[index].relationship = e.target.value;
									setFamilyMembers(updated);
									}}
									className="w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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

								{/* Remove Button */}
								<button
									type="button"
									onClick={() => {
									const updated = familyMembers.filter((_, i) => i !== index);
									setFamilyMembers(updated);
									}}
									className="text-red-600 hover:text-red-800 font-semibold"
								>
									✕
								</button>
								</div>
							))}

							{/* Add New Member */}
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
					<div className="w-[45%] h-full space-y-4 rounded-lg flex flex-col justify-top">
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

						{/* Image Upload */}
						<div className="w-full">
							<label className="block text-sm font-medium text-gray-700 mb-1">Add New Images (optional)</label>
							<input
								type="file"
								multiple
								onChange={(e) => {
								// Append newly selected files to existing `image` state
								const files = Array.from(e.target.files);
								setImage((prev) => [...prev, ...files]);
								}}
								className="w-full text-sm text-blue-500 font-italic file-input file-input-bordered rounded-lg cursor-pointer hover:text-blue-800"
							/>
							</div>

							{/* Display Existing + New Images */}
							<p className="text-sm text-gray-700 font-medium mb-1">Existing & New Images</p>
							<div className="w-full h-[calc(30vh)] overflow-y-auto border border-gray-300 rounded-md shadow-inner">
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
					</div>
				</div>
			</div> 
		</div>
	);
}
