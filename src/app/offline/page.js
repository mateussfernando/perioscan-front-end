import Link from "next/link"
import Image from "next/image"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src="/images/logos/logo-perio-scan.png" alt="PerioScan Logo" width={80} height={80} />
        </div>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <WifiOff size={40} className="text-gray-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Você está offline</h1>

        <p className="text-gray-600 mb-6">
          Não foi possível conectar à internet. Algumas funcionalidades podem estar indisponíveis até que a conexão seja
          restabelecida.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Tentar novamente
          </Link>

          <div className="text-sm text-gray-500">
            Você pode acessar dados salvos anteriormente enquanto estiver offline.
          </div>
        </div>
      </div>
    </div>
  )
}
