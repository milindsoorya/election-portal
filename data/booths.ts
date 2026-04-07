export interface PollingBooth {
  boothId: string;
  boothNumber: number;
  boothName: string;
  address: string;
  constituencyId: number;
  constituencyName: string;
  district: string;
  openTime: string;
  closeTime: string;
  totalVoters: number;
  accessible: boolean;
  hasRamp: boolean;
  hasHelperCabins: boolean;
}

export interface VoterRecord {
  voterId: string;
  name: string;
  fatherHusbandName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  boothId: string;
  address: string;
  serialNumber: number;
}

export const POLLING_BOOTHS: PollingBooth[] = [
  {
    boothId: "KL-KNR-01-001",
    boothNumber: 1,
    boothName: "Govt. Higher Secondary School, Dharmadom",
    address: "Near Dharmadom Junction, Dharmadom P.O., Kannur - 670 006",
    constituencyId: 8,
    constituencyName: "Dharmadom",
    district: "Kannur",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 784,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-KNR-01-002",
    boothNumber: 2,
    boothName: "Dharmadom Aided LP School",
    address: "Dharmadom Ward, Kannur Corporation, Kannur - 670 006",
    constituencyId: 8,
    constituencyName: "Dharmadom",
    district: "Kannur",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 812,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: false,
  },
  {
    boothId: "KL-TVM-08-001",
    boothNumber: 1,
    boothName: "Govt. Model Boys HSS, Thiruvananthapuram",
    address: "Museum Road, Palayam, Thiruvananthapuram - 695 001",
    constituencyId: 130,
    constituencyName: "Thiruvananthapuram",
    district: "Thiruvananthapuram",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 756,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-TVM-08-002",
    boothNumber: 2,
    boothName: "YWCA Hall, Thiruvananthapuram",
    address: "YWCA Road, Palayam, Thiruvananthapuram - 695 001",
    constituencyId: 130,
    constituencyName: "Thiruvananthapuram",
    district: "Thiruvananthapuram",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 698,
    accessible: false,
    hasRamp: false,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-EKM-05-001",
    boothNumber: 1,
    boothName: "Maharaja's College, Ernakulam",
    address: "Maharaja's College Road, Ernakulam - 682 011",
    constituencyId: 76,
    constituencyName: "Ernakulam",
    district: "Ernakulam",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 834,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-EKM-05-002",
    boothNumber: 2,
    boothName: "St. Albert's College Hall, Ernakulam",
    address: "Banerji Road, Kochi - 682 018",
    constituencyId: 76,
    constituencyName: "Ernakulam",
    district: "Ernakulam",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 778,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: false,
  },
  {
    boothId: "KL-PKD-03-001",
    boothNumber: 1,
    boothName: "Govt. Victoria College, Palakkad",
    address: "Victoria College Road, Palakkad - 678 001",
    constituencyId: 48,
    constituencyName: "Palakkad",
    district: "Palakkad",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 901,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-TSR-04-001",
    boothNumber: 1,
    boothName: "Thrissur Corporation School No. 1",
    address: "Round North, Thrissur - 680 001",
    constituencyId: 64,
    constituencyName: "Thrissur",
    district: "Thrissur",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 867,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-MLP-06-001",
    boothNumber: 1,
    boothName: "Govt. High School, Manjeri",
    address: "Manjeri Town, Malappuram - 676 121",
    constituencyId: 45,
    constituencyName: "Manjeri",
    district: "Malappuram",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 789,
    accessible: true,
    hasRamp: false,
    hasHelperCabins: true,
  },
  {
    boothId: "KL-KTM-07-001",
    boothNumber: 1,
    boothName: "CMS College Kottayam",
    address: "CMS College P.O., Kottayam - 686 001",
    constituencyId: 94,
    constituencyName: "Kottayam",
    district: "Kottayam",
    openTime: "07:00",
    closeTime: "18:00",
    totalVoters: 823,
    accessible: true,
    hasRamp: true,
    hasHelperCabins: true,
  },
];

// Sample voter records for demo
export const VOTER_RECORDS: VoterRecord[] = [
  {
    voterId: "KL/08/001/000234",
    name: "Rajesh Kumar M",
    fatherHusbandName: "Madhavan Nair K",
    age: 42,
    gender: "Male",
    boothId: "KL-KNR-01-001",
    address: "34/B, Dharmadom Ward, Kannur Corporation, Kannur - 670 006",
    serialNumber: 234,
  },
  {
    voterId: "KL/08/001/000567",
    name: "Sreelatha P",
    fatherHusbandName: "Prabhakaran K",
    age: 38,
    gender: "Female",
    boothId: "KL-KNR-01-001",
    address: "12, Narayan Nagar, Dharmadom, Kannur - 670 006",
    serialNumber: 567,
  },
  {
    voterId: "KL/16/001/001123",
    name: "Anitha Thomas",
    fatherHusbandName: "Thomas Varghese",
    age: 55,
    gender: "Female",
    boothId: "KL-TVM-08-001",
    address: "45, Palayam Road, Thiruvananthapuram - 695 001",
    serialNumber: 1123,
  },
  {
    voterId: "KL/05/001/000891",
    name: "Mohammed Ashraf K",
    fatherHusbandName: "Kunhammed K",
    age: 29,
    gender: "Male",
    boothId: "KL-EKM-05-001",
    address: "78, MG Road, Ernakulam - 682 011",
    serialNumber: 891,
  },
  {
    voterId: "KL/03/001/000456",
    name: "Vijayalakshmi R",
    fatherHusbandName: "Rajan M",
    age: 61,
    gender: "Female",
    boothId: "KL-PKD-03-001",
    address: "23, Gandhi Nagar, Palakkad - 678 001",
    serialNumber: 456,
  },
];
