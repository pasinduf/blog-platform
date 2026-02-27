import { profile } from "console";
import { User, Mail, Globe, Twitter } from "lucide-react";
import Image from 'next/image';

interface AuthorBioProps {
  firstName: string;
  lastName: string;
  bioDescription: string;
  profileImage?: string | null
}

export default function AuthorBio({ firstName, lastName, bioDescription, profileImage }: AuthorBioProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {profileImage ?
          <div className="relative h-12 w-12 rounded-full overflow-hidden border hover:bg-transparent p-0">
            <Image src={profileImage} alt="Profile" fill className="object-cover" /> :
          </div> :
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {`${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`}
          </div>
        }
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">About the Author</h3>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{firstName} {lastName}</h4>
          <p className="text-gray-600 mb-4">
            {bioDescription}
          </p>
          {/* <div className="flex items-center gap-4">
            <a href={`mailto:${author.email}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
              <Twitter className="w-4 h-4" />
              <span className="text-sm">Twitter</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-blue-700 transition-colors">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Website</span>
            </a>
          </div> */}
        </div>
        {/* <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">Follow</button> */}
      </div>
    </div>
  );
}
