import Image from 'next/image';

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-t pt-4">
          <div className="flex items-start space-x-4">
            {review.users ? (
              <Image
                src={review.users.avatar_url || '/default-avatar.png'}
                alt={`${review.users.name}'s avatar`}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-baseline mb-2">
                <span className="font-medium text-gray-900 mr-2">{review.users?.name || 'Anonymous'}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-4 w-4 text-yellow-300"
                      fill={star <= review.rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.218 3.945c.391 1.277.1 2.726-1.023 3.136l-4.248 1.302a1 1 0 00-1.563.548l-2.102-3.62a1 1 0 00-.363-1.118L4.043 8.047a1 1 0 00-.588-1.81l3.976-2.888a1 1 0 00.588-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
