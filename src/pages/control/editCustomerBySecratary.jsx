import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function EditMember() {
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [expanded, setExpanded] = useState("basic"); 

	// Example states (replace with your actual ones)
	const [customer, setCustomer] = useState({});
	const [customerId, setCustomerId] = useState("");
	const [title, setTitle] = useState("Mr.");
	const [name, setName] = useState("");
	const [memberRole, setMemberRole] = useState("member");
	const [nameSinhala, setNameSinhala] = useState("");
	const [address, setAddress] = useState("");
	const [mobile, setMobile] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [notes, setNotes] = useState("");
	const [familyMembers, setFamilyMembers] = useState([]);
	const [existingImages, setExistingImages] = useState([]);
	const [image, setImage] = useState([]);

	const navigate = useNavigate();

	const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    // if (!user) navigate("/");
    // if (user.memberRole !== 'secretary') navigate("/");

    const searchCustomer = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {         
            // Fetch applicant details
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`
            );
            if (res.data) {
                setCustomer(res.data);
				setCustomerId(res.data.customerId || "");
				setTitle(res.data.title || "");
				setName(res.data.name || "");
				setNameSinhala(res.data.nameSinhala || "");
				setMemberRole(res.data.memberRole || "");
				setAddress(Array.isArray(res.data.address) ? res.data.address.join(", ") : res.data.address || "");
				setNotes(res.data.notes || "");
				setMobile(res.data.mobile || "");
				setPhone(res.data.phone || "");
				setEmail(res.data.email || "");
				setExistingImages(res.data.image || []);
				setFamilyMembers(res.data.familyMembers || [{ name: "", relationship: "" }]);				
            }           
        } catch (err) {
            toast.error(err.response?.data?.message || "වලංගු නොවන සාමාජික අංකයක්");
        } finally {
            setIsLoading(false);
        }
    };

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
			toast.error("කරුණාකර නම, ජංගම දුරකථන අංකය සහ සාමාජික භූමිකාව පුරවන්න.");
			setIsUpdating(false);
			return;
		}

		// validate member role
		const validRoles = ['member', 'chairman', 'secretary', 'treasurer', 'manager', 'executive', 'admin'];
		if (!validRoles.includes(memberRole)) {
			toast.error("Please select a valid member role");
			setIsUpdating(false);
			return;
		}
		if (memberRole === 'admin' ||
			memberRole === 'chairman' || 
			memberRole === 'secretary' || 
			memberRole === 'treasurer' || 
			memberRole === 'manager' || 
			memberRole === 'executive'
		) {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/customer`

			);
			const adminCount = response.data.filter(
				(cust) => cust.memberRole === 'admin' && cust.customerId !== customerId
				).length;
			const chairmanCount = response.data.filter(
				(cust) => cust.memberRole === 'chairman' && cust.customerId !== customerId
				).length;
			const secretaryCount = response.data.filter(
				(cust) => cust.memberRole === 'secretary' && cust.customerId !== customerId
				).length;
			const treasurerCount = response.data.filter(
				(cust) => cust.memberRole === 'treasurer' && cust.customerId !== customerId
				).length;
			const managerCount = response.data.filter(
				(cust) => cust.memberRole === 'manager' && cust.customerId !== customerId
				).length;
			const executiveCount = response.data.filter(
				(cust) => cust.memberRole === 'executive' && cust.customerId !== customerId
				).length;	
			if (memberRole === 'admin' && adminCount >= 1) {
				toast.error("එක් පරිපාලකයෙකු පමණක් නිර්මාණය කළ හැකිය. කරුණාකර පළමුව පවතින පරිපාලකයෙකු මකන්න.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'chairman' && chairmanCount >= 1) {
				toast.error("එක් සභාපතිවරයෙකු පමණක් නිර්මාණය කළ හැකිය. කරුණාකර පළමුව පවතින සභාපතිවරයා මකා දමන්න.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'secretary' && secretaryCount >= 1) {
				toast.error("එක් ලේකම්වරයෙකු පමණක් නිර්මාණය කළ හැකිය. කරුණාකර පළමුව පවතින ලේකම්වරයා මකා දමන්න.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'treasurer' && treasurerCount >= 1) {
				toast.error("එක් භාණ්ඩාගාරිකවරයෙකු පමණක් නිර්මාණය කළ හැකිය. කරුණාකර පළමුව පවතින භාණ්ඩාගාරික මකා දමන්න.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'manager' && managerCount >= 1) {
				toast.error("එක් කළමනාකරුවෙකු පමණක් නිර්මාණය කළ හැකිය. කරුණාකර පළමුව පවතින කළමනාකරු මකන්න.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'executive' && customerId > "018") {
				toast.error("පළමු සාමාජිකයින් 10 දෙනා තුළ සිටින සාමාජිකයින්ට පමණක් විධායකයින් ලෙස පත් කළ හැකිය.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'executive' && executiveCount > 5) {
				toast.error("උපරිම විධායක නිලධාරීන් 5 දෙනෙකු නිර්මාණය කළ හැකිය. කරුණාකර පළමුව පවතින විධායක නිලධාරියෙකු මකා දමන්න.");
				setIsUpdating(false);
				return;
			}
		}

		// Validate family members
		const invalidFamilyMember = familyMembers.some(
			(member) => !member.name || !member.relationship
		);
		if (invalidFamilyMember) {
			toast.error("කරුණාකර පවුලේ සියලුම සාමාජිකයින්ට නම සහ ඥාතිත්වය යන දෙකම ඇති බවට සහතික වන්න.");
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
		} finally {
			setIsUpdating(false);
		}
	}


	return (
		<div className="w-full min-h-screen flex flex-col p-4 bg-gray-50">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
			<div>
				<h1 className="text-xl font-semibold text-gray-800">✏️ Edit Member</h1>
				<p className="text-sm text-gray-500">Update existing member information</p>
			</div>

			<div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
				<button
				onClick={async () => {
					setIsUpdating(true);
					await updateProduct();
					setIsUpdating(false);
				}}
				disabled={isUpdating}
				className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium shadow-md transition text-white ${
					isUpdating
					? "bg-gray-500 cursor-not-allowed"
					: "bg-blue-600 hover:bg-blue-700"
				}`}
				>
				{isUpdating ? "Updating..." : "Update Member"}
				</button>

				<Link
				to="/admin"
				className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow text-center"
				>
				Cancel
				</Link>
			</div>
			</div>

			{/* Form Container */}
			<div className="bg-white w-full p-4 sm:p-8 shadow rounded-xl border border-gray-200">
			{/* Two-column → stack on mobile */}
			<div className="flex flex-col lg:flex-row justify-between gap-6">
				{/* Left Column */}
				<div className="w-full lg:w-[50%] space-y-4">
				{/* Member ID, Title, Name */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="w-full sm:w-1/4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Number
						</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="000"
                            maxLength={3}
                            value={customerId}
                            onChange={async (e) => {
                                const value = e.target.value;
                                setCustomerId(value);
                                if (value.length === 3) {
                                await searchCustomer(value);
                                }
                            }}
                        />
					</div>

					<div className="w-full sm:w-[20%]">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Title
					</label>
					<select
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					>
						<option value="Mr.">Mr.</option>
						<option value="Mrs.">Mrs.</option>
						<option value="Miss.">Miss.</option>
					</select>
					</div>

					<div className="w-full sm:flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Member Name (English)
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						placeholder="e.g. Sunil Gunarathne"
					/>
					</div>
				</div>
				<div className="w-full sm:flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Name (Sinhala)
					</label>
					<input
						type="text"
						value={nameSinhala}
						onChange={(e) => setNameSinhala(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						placeholder="e.g. සුනිල් ගුණරත්න"
					/>
				</div>
	 			{/* Member Role + Sinhala Name */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="w-full sm:w-[40%]">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Member Role
					</label>
					<select
						value={memberRole}
						onChange={(e) => setMemberRole(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
				</div>

				{/* Family Members */}
				<div className="space-y-3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Family Members
					</label>

					{familyMembers.map((member, index) => (
					<div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
							<option value="">Select</option>
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
							onClick={() => {
							const updated = familyMembers.filter((_, i) => i !== index);
							setFamilyMembers(updated);
							}}
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
					className="mt-2 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
					>
					+ Add Family Member
					</button>
				</div>
				</div>

				{/* Right Column */}
				<div className="w-full lg:w-[45%] space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Address
					</label>
					<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					placeholder="e.g. 45/B, Colombo Road, Galle"
					/>
				</div>

				{/* Contact Section */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="w-full sm:w-1/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Mobile
					</label>
					<input
						type="text"
						value={mobile}
						onChange={(e) => setMobile(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					/>
					</div>
					<div className="w-full sm:w-1/3">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Phone
					</label>
					<input
						type="text"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
					/>
					</div>
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Description
					</label>
					<textarea
					rows="3"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					placeholder="Additional notes about the member..."
					></textarea>
				</div>

	 			{/* Image Upload */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
					Add New Images (optional)
					</label>
					<input
					type="file"
					multiple
					onChange={(e) => {
						const files = Array.from(e.target.files);
						setImage((prev) => [...prev, ...files]);
					}}
					className="w-full text-sm text-blue-600 cursor-pointer"
					/>
				</div>

				<div>
					<p className="text-sm font-medium text-gray-700 mb-2">
					Existing & New Images
					</p>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-300 p-2 rounded-lg shadow-inner">
					{/* Existing */}
					{existingImages.map((imgUrl, index) => (
						<div key={`existing-${index}`} className="relative rounded-md overflow-hidden">
						<img src={imgUrl} alt="" className="w-full h-24 object-cover" />
						<button
							type="button"
							onClick={() =>
							setExistingImages(existingImages.filter((_, i) => i !== index))
							}
							className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
						>
							✕
						</button>
						</div>
					))}
	 				{/* New */}
					{image.map((file, index) => (
						<div key={`new-${index}`} className="relative rounded-md overflow-hidden">
						<img
							src={URL.createObjectURL(file)}
							alt=""
							className="w-full h-24 object-cover"
						/>
						<button
							type="button"
							onClick={() =>
							setImage(image.filter((_, i) => i !== index))
							}
							className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
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
