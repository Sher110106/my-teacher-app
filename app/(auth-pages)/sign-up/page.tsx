'use client'
import { useState, useEffect } from "react";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default function Signup(props: { searchParams: Promise<Message>; }) {
  const [searchParams, setSearchParams] = useState<Message | null>(null);
  const [selectedRole, setSelectedRole] = useState<'school' | 'teacher' | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const predefinedLocations = ['Abohar, Punjab, India', 'Achalpur, Maharashtra, India', 'Adilabad, Andhra pradesh, India', 'Adityapur, Jharkhand, India', 'Adoni, Andhra pradesh, India', 'Agartala, Tripura, India', 'Agra, Uttar pradesh, India', 'Ahmadabad, Gujarat, India', 'Ahmadnagar, Maharashtra, India', 'Aizawl, Mizoram, India', 'Ajmer, Rajasthan, India', 'Akbarpur, Uttar pradesh, India', 'Akola, Maharashtra, India', 'Alandur, Tamil nadu, India', 'Alappuzha, Kerala, India', 'Aligarh, Uttar pradesh, India', 'Allahabad, Uttar pradesh, India', 'Alwar, Rajasthan, India', 'Ambala, Haryana, India', 'Ambala Sadar, Haryana, India', 'Ambarnath, Maharashtra, India', 'Ambattur, Tamil nadu, India', 'Ambikapur, Chhattisgarh, India', 'Ambur, Tamil nadu, India', 'Amravati, Maharashtra, India', 'Amreli, Gujarat, India', 'Amritsar, Punjab, India', 'Amroha, Uttar pradesh, India', 'Anand, Gujarat, India', 'Anantapur, Andhra pradesh, India', 'Anantnag, Jammu & kashmir, India', 'Arrah, Bihar, India', 'Asansol, West bengal, India', 'Ashoknagar Kalyangarh, West bengal, India', 'Aurangabad, Bihar, India', 'Aurangabad, Maharashtra, India', 'Avadi, Tamil nadu, India', 'Azamgarh, Uttar pradesh, India', 'Badlapur, Maharashtra, India', 'Bagaha, Bihar, India', 'Bagalkot, Karnataka, India', 'Bahadurgarh, Haryana, India', 'Baharampur, West bengal, India', 'Bahraich, Uttar pradesh, India', 'Baidyabati, West bengal, India', 'Baleshwar Town, Orissa, India', 'Ballia, Uttar pradesh, India', 'Bally, West bengal, India', 'Bally City, West bengal, India', 'Balurghat, West bengal, India', 'Banda, Uttar pradesh, India', 'Bankura, West bengal, India', 'Bansberia, West bengal, India', 'Banswara, Rajasthan, India', 'Baran, Rajasthan, India', 'Baranagar, West bengal, India', 'Barasat, West bengal, India', 'Baraut, Uttar pradesh, India', 'Barddhaman, West bengal, India', 'Bareilly, Uttar pradesh, India', 'Baripada Town, Orissa, India', 'Barnala, Punjab, India', 'Barrackpur, West bengal, India', 'Barshi, Maharashtra, India', 'Basirhat, West bengal, India', 'Basti, Uttar pradesh, India', 'Batala, Punjab, India', 'Bathinda, Punjab, India', 'Beawar, Rajasthan, India', 'Begusarai, Bihar, India', 'Belgaum, Karnataka, India', 'Bellary, Karnataka, India', 'Bengaluru, Karnataka, India', 'Bettiah, Bihar, India', 'Betul, Madhya pradesh, India', 'Bhadrak, Orissa, India', 'Bhadravati, Karnataka, India', 'Bhadreswar, West bengal, India', 'Bhagalpur, Bihar, India', 'Bhalswa Jahangir Pur, Nct of delhi, India', 'Bharatpur, Rajasthan, India', 'Bharuch, Gujarat, India', 'Bhatpara, West bengal, India', 'Bhavnagar, Gujarat, India', 'Bhilai Nagar, Chhattisgarh, India', 'Bhilwara, Rajasthan, India', 'Bhimavaram, Andhra pradesh, India', 'Bhind, Madhya pradesh, India', 'Bhiwadi, Rajasthan, India', 'Bhiwandi, Maharashtra, India', 'Bhiwani, Haryana, India', 'Bhopal, Madhya pradesh, India', 'Bhubaneswar Town, Orissa, India', 'Bhuj, Gujarat, India', 'Bhusawal, Maharashtra, India', 'Bid, Maharashtra, India', 'Bidar, Karnataka, India', 'Bidhan Nagar, West bengal, India', 'Biharsharif, Bihar, India', 'Bijapur, Karnataka, India', 'Bikaner, Rajasthan, India', 'Bilaspur, Chhattisgarh, India', 'Bokaro Steel City, Jharkhand, India', 'Bongaon, West bengal, India', 'Botad, Gujarat, India', 'Brahmapur Town, Orissa, India', 'Budaun, Uttar pradesh, India', 'Bulandshahr, Uttar pradesh, India', 'Bundi, Rajasthan, India', 'Burari, Nct of delhi, India', 'Burhanpur, Madhya pradesh, India', 'Buxar, Bihar, India', 'Champdani, West bengal, India', 'Chandannagar, West bengal, India', 'Chandausi, Uttar pradesh, India', 'Chandigarh, Chandigarh, India', 'Chandrapur, Maharashtra, India', 'Chapra, Bihar, India', 'Chas, Jharkhand, India', 'Chennai, Tamil nadu, India', 'Chhattarpur, Madhya pradesh, India', 'Chhindwara, Madhya pradesh, India', 'Chikmagalur, Karnataka, India', 'Chilakaluripet, Andhra pradesh, India', 'Chitradurga, Karnataka, India', 'Chittaurgarh, Rajasthan, India', 'Chittoor, Andhra pradesh, India', 'Churu, Rajasthan, India', 'Coimbatore, Tamil nadu, India', 'Cuddalore, Tamil nadu, India', 'Cuttack, Orissa, India', 'Dabgram, West bengal, India', 'Dallo Pura, Nct of delhi, India', 'Damoh, Madhya pradesh, India', 'Darbhanga, Bihar, India', 'Darjiling, West bengal, India', 'Datia, Madhya pradesh, India', 'Davanagere, Karnataka, India', 'Deesa, Gujarat, India', 'Dehradun, Uttarakhand, India', 'Dehri, Bihar, India', 'Delhi, Nct of delhi, India', 'Delhi Cantonment, Nct of delhi, India', 'Deoghar, Jharkhand, India', 'Deoli, Nct of delhi, India', 'Deoria, Uttar pradesh, India', 'Dewas, Madhya pradesh, India', 'Dhanbad, Jharkhand, India', 'Dharmavaram, Andhra pradesh, India', 'Dhaulpur, Rajasthan, India', 'Dhule, Maharashtra, India', 'Dibrugarh, Assam, India', 'Dimapur, Nagaland, India', 'Dinapur Nizamat, Bihar, India', 'Dindigul, Tamil nadu, India', 'Dum Dum, West bengal, India', 'Durg, Chhattisgarh, India', 'Durgapur, West bengal, India', 'Eluru, Andhra pradesh, India', 'English Bazar, West bengal, India', 'Erode, Tamil nadu, India', 'Etah, Uttar pradesh, India', 'Etawah, Uttar pradesh, India', 'Faizabad, Uttar pradesh, India', 'Faridabad, Haryana, India', 'Farrukhabad-cum-Fatehgarh, Uttar pradesh, India', 'Fatehpur, Uttar pradesh, India', 'Firozabad, Uttar pradesh, India', 'Firozpur, Punjab, India', 'Gadag-Betigeri, Karnataka, India', 'Gandhidham, Gujarat, India', 'Gandhinagar, Gujarat, India', 'Ganganagar, Rajasthan, India', 'Gangapur City, Rajasthan, India', 'Gangawati, Karnataka, India', 'Gaya, Bihar, India', 'Ghazipur, Uttar pradesh, India', 'Giridih, Jharkhand, India', 'Godhra, Gujarat, India', 'Gokal Pur, Nct of delhi, India', 'Gonda, Uttar pradesh, India', 'Gondal, Gujarat, India', 'Gondiya, Maharashtra, India', 'Gorakhpur, Uttar pradesh, India', 'Greater Hyderabad, Andhra pradesh, India', 'Greater Mumbai, Maharashtra, India', 'Greater Noida, Uttar pradesh, India', 'Gudivada, Andhra pradesh, India', 'Gulbarga, Karnataka, India', 'Guna, Madhya pradesh, India', 'Guntakal, Andhra pradesh, India', 'Guntur, Andhra pradesh, India', 'Gurgaon, Haryana, India', 'Guwahati, Assam, India', 'Gwalior, Madhya pradesh, India', 'Habra, West bengal, India', 'Hajipur, Bihar, India', 'Haldia, West bengal, India', 'Haldwani-cum-Kathgodam, Uttarakhand, India', 'Halisahar, West bengal, India', 'Hanumangarh, Rajasthan, India', 'Haora, West bengal, India', 'Hapur, Uttar pradesh, India', 'Hardoi, Uttar pradesh, India', 'Hardwar, Uttarakhand, India', 'Hassan, Karnataka, India', 'Hastsal, Nct of delhi, India', 'Hathras, Uttar pradesh, India', 'Hazaribag, Jharkhand, India', 'Hindaun, Rajasthan, India', 'Hindupur, Andhra pradesh, India', 'Hinganghat, Maharashtra, India', 'Hisar, Haryana, India', 'Hoshangabad, Madhya pradesh, India', 'Hoshiarpur, Punjab, India', 'Hospet, Karnataka, India', 'Hosur, Tamil nadu, India', 'Hubli-Dharwad, Karnataka, India', 'Hugli-Chinsurah, West bengal, India', 'Ichalkaranji, Maharashtra, India', 'Imphal, Manipur , India', 'Indore, Madhya pradesh, India', 'Jabalpur, Madhya pradesh, India', 'Jagadhri, Haryana, India', 'Jagdalpur, Chhattisgarh, India', 'Jaipur, Rajasthan, India', 'Jalandhar, Punjab, India', 'Jalgaon, Maharashtra, India', 'Jalna, Maharashtra, India', 'Jalpaiguri, West bengal, India', 'Jamalpur, Bihar, India', 'Jammu, Jammu & kashmir, India', 'Jamnagar, Gujarat, India', 'Jamshedpur, Jharkhand, India', 'Jamuria, West bengal, India', 'Jaunpur, Uttar pradesh, India', 'Jehanabad, Bihar, India', 'Jetpur Navagadh, Gujarat, India', 'Jhansi, Uttar pradesh, India', 'Jhunjhunun, Rajasthan, India', 'Jind, Haryana, India', 'Jodhpur, Rajasthan, India', 'Junagadh, Gujarat, India', 'Kadapa, Andhra pradesh, India', 'Kaithal, Haryana, India', 'Kakinada, Andhra pradesh, India', 'Kalol, Gujarat, India', 'Kalyani, West bengal, India', 'Kamarhati, West bengal, India', 'Kancheepuram, Tamil nadu, India', 'Kanchrapara, West bengal, India', 'Kanpur, Uttar pradesh, India', 'Kanpur City, Uttar pradesh, India', 'Karaikkudi, Tamil nadu, India', 'Karawal Nagar, Nct of delhi, India', 'Karimnagar, Andhra pradesh, India', 'Karnal, Haryana, India', 'Kasganj, Uttar pradesh, India', 'Kashipur, Uttarakhand, India', 'Katihar, Bihar, India', 'Khammam, Andhra pradesh, India', 'Khandwa, Madhya pradesh, India', 'Khanna, Punjab, India', 'Kharagpur, West bengal, India', 'Khardaha, West bengal, India', 'Khargone, Madhya pradesh, India', 'Khora, Uttar pradesh, India', 'Khurja, Uttar pradesh, India', 'Kirari Suleman Nagar, Nct of delhi, India', 'Kishanganj, Bihar, India', 'Kishangarh, Rajasthan, India', 'Kochi, Kerala, India', 'Kolar, Karnataka, India', 'Kolhapur, Maharashtra, India', 'Kolkata, West bengal, India', 'Kollam, Kerala, India', 'Korba, Chhattisgarh, India', 'Kota, Rajasthan, India', 'Kozhikode, Kerala, India', 'Krishnanagar, West bengal, India', 'Kulti, West bengal, India', 'Kumbakonam, Tamil nadu, India', 'Kurichi, Tamil nadu, India', 'Kurnool, Andhra pradesh, India', 'Lakhimpur, Uttar pradesh, India', 'Lalitpur, Uttar pradesh, India', 'Latur, Maharashtra, India', 'Loni, Uttar pradesh, India', 'Lucknow, Uttar pradesh, India', 'Ludhiana, Punjab, India', 'Machilipatnam, Andhra pradesh, India', 'Madanapalle, Andhra pradesh, India', 'Madavaram, Tamil nadu, India', 'Madhyamgram, West bengal, India', 'Madurai, Tamil nadu, India', 'Mahbubnagar, Andhra pradesh, India', 'Mahesana, Gujarat, India', 'Maheshtala, West bengal, India', 'Mainpuri, Uttar pradesh, India', 'Malegaon, Maharashtra, India', 'Malerkotla, Punjab, India', 'Mandoli, Nct of delhi, India', 'Mandsaur, Madhya pradesh, India', 'Mandya, Karnataka, India', 'Mangalore, Karnataka, India', 'Mango, Jharkhand, India', 'Mathura, Uttar pradesh, India', 'Maunath Bhanjan, Uttar pradesh, India', 'Medinipur, West bengal, India', 'Meerut, Uttar pradesh, India', 'Mira Bhayander, Maharashtra, India', 'Miryalaguda, Andhra pradesh, India', 'Mirzapur-cum-Vindhyachal, Uttar pradesh, India', 'Modinagar, Uttar pradesh, India', 'Moga, Punjab, India', 'Moradabad, Uttar pradesh, India', 'Morena, Madhya pradesh, India', 'Morvi, Gujarat, India', 'Motihari, Bihar, India', 'Mughalsarai, Uttar pradesh, India', 'Muktsar, Punjab, India', 'Munger, Bihar, India', 'Murwara, Madhya pradesh, India', 'Mustafabad, Nct of delhi, India', 'Muzaffarnagar, Uttar pradesh, India', 'Muzaffarpur, Bihar, India', 'Mysore, Karnataka, India', 'Nabadwip, West bengal, India', 'Nadiad, Gujarat, India', 'Nagaon, Assam, India', 'Nagapattinam, Tamil nadu, India', 'Nagaur, Rajasthan, India', 'Nagda, Madhya pradesh, India', 'Nagercoil, Tamil nadu, India', 'Nagpur, Maharashtra, India', 'Naihati, West bengal, India', 'Nalgonda, Andhra pradesh, India', 'Nanded Waghala, Maharashtra, India', 'Nandurbar, Maharashtra, India', 'Nandyal, Andhra pradesh, India', 'Nangloi Jat, Nct of delhi, India', 'Narasaraopet, Andhra pradesh, India', 'Nashik, Maharashtra, India', 'Navi Mumbai, Maharashtra, India', 'Navi Mumbai Panvel Raigarh, Maharashtra, India', 'Navsari, Gujarat, India', 'Neemuch, Madhya pradesh, India', 'Nellore, Andhra pradesh, India', 'New Delhi, Nct of delhi, India', 'Neyveli, Tamil nadu, India', 'Nizamabad, Andhra pradesh, India', 'Noida, Uttar pradesh, India', 'North Barrackpur, West bengal, India', 'North Dum Dum, West bengal, India', 'Ongole, Andhra pradesh, India', 'Orai, Uttar pradesh, India', 'Osmanabad, Maharashtra, India', 'Ozhukarai, Puducherry, India', 'Palakkad, Kerala, India', 'Palanpur, Gujarat, India', 'Pali, Rajasthan, India', 'Pallavaram, Tamil nadu, India', 'Palwal, Haryana, India', 'Panchkula, Haryana, India', 'Panihati, West bengal, India', 'Panipat, Haryana, India', 'Panvel, Maharashtra, India', 'Parbhani, Maharashtra, India', 'Patan, Gujarat, India', 'Pathankot, Punjab, India', 'Patiala, Punjab, India', 'Patna, Bihar, India', 'Pilibhit, Uttar pradesh, India', 'Pimpri Chinchwad, Maharashtra, India', 'Pithampur, Madhya pradesh, India', 'Porbandar, Gujarat, India', 'Port Blair, Andaman & nicobar islands, India', 'Proddatur, Andhra pradesh, India', 'Puducherry, Puducherry, India', 'Pudukkottai, Tamil nadu, India', 'Pune, Maharashtra, India', 'Puri, Orissa, India', 'Purnia, Bihar, India', 'Puruliya, West bengal, India', 'Rae Bareli, Uttar pradesh, India', 'Raichur, Karnataka, India', 'Raiganj, West bengal, India', 'Raigarh, Chhattisgarh, India', 'Raipur, Chhattisgarh, India', 'Rajahmundry, Andhra pradesh, India', 'Rajapalayam, Tamil nadu, India', 'Rajarhat Gopalpur, West bengal, India', 'Rajkot, Gujarat, India', 'Rajnandgaon, Chhattisgarh, India', 'Rajpur Sonarpur, West bengal, India', 'Ramagundam, Andhra pradesh, India', 'Rampur, Uttar pradesh, India', 'Ranchi, Jharkhand, India', 'Ranibennur, Karnataka, India', 'Raniganj, West bengal, India', 'Ratlam, Madhya pradesh, India', 'Raurkela Industrial Township, Orissa, India', 'Raurkela Town, Orissa, India', 'Rewa, Madhya pradesh, India', 'Rewari, Haryana, India', 'Rishra, West bengal, India', 'Robertson Pet, Karnataka, India', 'Rohtak, Haryana, India', 'Roorkee, Uttarakhand, India', 'Rudrapur, Uttarakhand, India', 'S.A.S. Nagar, Punjab, India', 'Sagar, Madhya pradesh, India', 'Saharanpur, Uttar pradesh, India', 'Saharsa, Bihar, India', 'Salem, Tamil nadu, India', 'Sambalpur, Orissa, India', 'Sambhal, Uttar pradesh, India', 'Sangli Miraj Kupwad, Maharashtra, India', 'Santipur, West bengal, India', 'Sasaram, Bihar, India', 'Satara, Maharashtra, India', 'Satna, Madhya pradesh, India', 'Sawai Madhopur, Rajasthan, India', 'Secunderabad, Andhra pradesh, India', 'Sehore, Madhya pradesh, India', 'Seoni, Madhya pradesh, India', 'Serampore, West bengal, India', 'Shahjahanpur, Uttar pradesh, India', 'Shamli, Uttar pradesh, India', 'Shikohabad, Uttar pradesh, India', 'Shillong, Meghalaya, India', 'Shimla, Himachal pradesh, India', 'Shimoga, Karnataka, India', 'Shivpuri, Madhya pradesh, India', 'Sikar, Rajasthan, India', 'Silchar, Assam, India', 'Siliguri, West bengal, India', 'Singrauli, Madhya pradesh, India', 'Sirsa, Haryana, India', 'Sitapur, Uttar pradesh, India', 'Siwan, Bihar, India', 'Solapur, Maharashtra, India', 'Sonipat, Haryana, India', 'South Dum Dum, West bengal, India', 'Srikakulam, Andhra pradesh, India', 'Srinagar, Jammu & kashmir, India', 'Sujangarh, Rajasthan, India', 'Sultan Pur Majra, Nct of delhi, India', 'Sultanpur, Uttar pradesh, India', 'Surat, Gujarat, India', 'Surendranagar Dudhrej, Gujarat, India', 'Suryapet, Andhra pradesh, India', 'Tadepalligudem, Andhra pradesh, India', 'Tadpatri, Andhra pradesh, India', 'Tambaram, Tamil nadu, India', 'Tenali, Andhra pradesh, India', 'Thane, Maharashtra, India', 'Thanesar, Haryana, India', 'Thanjavur, Tamil nadu, India', 'Thiruvananthapuram, Kerala, India', 'Thoothukkudi, Tamil nadu, India', 'Thrissur, Kerala, India', 'Tiruchirappalli, Tamil nadu, India', 'Tirunelveli, Tamil nadu, India', 'Tirupati, Andhra pradesh, India', 'Tiruppur, Tamil nadu, India', 'Tiruvannamalai, Tamil nadu, India', 'Tiruvottiyur, Tamil nadu, India', 'Titagarh, West bengal, India', 'Tonk, Rajasthan, India', 'Tumkur, Karnataka, India', 'Udaipur, Rajasthan, India', 'Udgir, Maharashtra, India', 'Udupi, Karnataka, India', 'Ujjain, Madhya pradesh, India', 'Ulhasnagar, Maharashtra, India', 'Uluberia, West bengal, India', 'Unnao, Uttar pradesh, India', 'Uttarpara Kotrung, West bengal, India', 'Vadodara, Gujarat, India', 'Valsad, Gujarat, India', 'Varanasi, Uttar pradesh, India', 'Vasai Virar City, Maharashtra, India', 'Vellore, Tamil nadu, India', 'Veraval, Gujarat, India', 'Vidisha, Madhya pradesh, India', 'Vijayawada, Andhra pradesh, India', 'Visakhapatnam, Andhra pradesh, India', 'Vizianagaram, Andhra pradesh, India', 'Warangal, Andhra pradesh, India', 'Wardha, Maharashtra, India', 'Yamunanagar, Haryana, India', 'Yavatmal, Maharashtra, India'];

  useEffect(() => {
    async function fetchSearchParams() {
      const params = await props.searchParams;
      setSearchParams(params);
    }
    fetchSearchParams();
  }, [props.searchParams]);

  useEffect(() => {
    const suggestions = predefinedLocations.filter(location =>
      location.toLowerCase().includes(locationInput.toLowerCase())
    );
    setFilteredLocations(suggestions);
  }, [locationInput]);

  const handleRoleChange = (value: 'school' | 'teacher') => {
    setSelectedRole(value);
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(value)) {
        // If the subject is already selected, remove it
        return prev.filter((subject) => subject !== value);
      } else if (prev.length < 3) {
        // Add the subject only if the current selection is less than 3
        return [...prev, value];
      }
      // Return the same array if the limit is reached
      return prev;
    });
  };
  

  const handleLocationSelect = (location: string) => {
    setLocationInput(location);
    setFilteredLocations([]); // Clear suggestions after selection
  };

  if (searchParams && "message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form
        className="flex flex-col min-w-64 max-w-64 mx-auto"
        method="POST"
        action="/api/sign-up"
      >
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <Label htmlFor="role">Role</Label>
          <div className="flex gap-2">
            <Label htmlFor="schoolCheckbox" className="flex items-center gap-2">
              <Input
                type="checkbox"
                id="schoolCheckbox"
                name="role"
                value="school"
                checked={selectedRole === 'school'}
                onChange={() => handleRoleChange('school')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              School
            </Label>
            <Label htmlFor="teacherCheckbox" className="flex items-center gap-2">
              <Input
                type="checkbox"
                id="teacherCheckbox"
                name="role"
                value="teacher"
                checked={selectedRole === 'teacher'}
                onChange={() => handleRoleChange('teacher')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Teacher
            </Label>
          </div>

          {selectedRole === 'school' && (
            <>
              <Label htmlFor="schoolName">School Name</Label>
              <Input name="schoolName" placeholder="Your School Name" required />
              <Label htmlFor="location">Location</Label>
              <Input
                name="location"
                placeholder="School Location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                required
              />
              {filteredLocations.length > 0 && (
                <ul className="border border-gray-300 bg-black text-white rounded-md mt-2 max-h-40 overflow-y-auto">
                  {filteredLocations.map((location, index) => (
                    <li
                      key={index}
                      onClick={() => handleLocationSelect(location)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                    >
                      {location}
                    </li>
                  ))}
                </ul>
              )}
              <Label htmlFor="curriculumType">Curriculum Type</Label>
              <Input name="curriculumType" placeholder="Curriculum Type" required />
            </>
          )}

          {selectedRole === 'teacher' && (
            <>
              <Label htmlFor="fullName">Full Name</Label>
              <Input name="fullName" placeholder="Your Full Name" required />
              <Label htmlFor="subjects">Subjects</Label>
              <div className="flex flex-col gap-2">
                <Label htmlFor="math" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="math"
                    name="subjects"
                    value="math"
                    checked={selectedSubjects.includes("math")}
                    onChange={() => handleSubjectChange("math")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Math
                </Label>
                <Label htmlFor="science" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="science"
                    name="subjects"
                    value="science"
                    checked={selectedSubjects.includes("science")}
                    onChange={() => handleSubjectChange("science")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Science
                </Label>
                <Label htmlFor="english" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="english"
                    name="subjects"
                    value="english"
                    checked={selectedSubjects.includes("english")}
                    onChange={() => handleSubjectChange("english")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  English
                </Label>
                <Label htmlFor="history" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="history"
                    name="subjects"
                    value="history"
                    checked={selectedSubjects.includes("history")}
                    onChange={() => handleSubjectChange("history")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  History
                </Label>
              </div>
              {selectedSubjects.length === 3 && (
                <p className="text-sm text-red-500">You can select a maximum of 3 subjects.</p>
              )}

              <Label htmlFor="qualifications">Qualifications</Label>
              <Input name="qualifications" placeholder="Qualifications" required />
              <Label htmlFor="experienceYears">Experience Years</Label>
              <Input name="experienceYears" placeholder="Experience Years" type="number" required />
            </>
          )}

          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          {searchParams && <FormMessage message={searchParams} />}
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}
