import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { CUSTOMER_REVIEWS, FAQ_ITEMS } from '../data/mockData';

export const ReviewsAndFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-[#FAF8F5]">
      {/* Customer Reviews Section */}
      <section id="reviews" className="py-24 border-b border-[#E8E2D5]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#8C6D37] uppercase block mb-3">
              OPINIONES & TESTIMONIOS REALES
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] font-normal tracking-tight">
              Historias que ya viven en papel
            </h2>
            <p className="text-sm sm:text-base text-[#595248] font-light mt-4 max-w-xl mx-auto leading-relaxed">
              Familias y fotógrafos que transformaron sus memorias digitales en legados tangibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CUSTOMER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-[#FDFCF9] border border-[#E8E2D5] p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#D6CEBE] transition-colors"
              >
                <div>
                  {/* Photo of their book */}
                  <div className="aspect-[16/10] overflow-hidden mb-6 bg-[#EFE9DE] border border-[#E8E2D5]/50">
                    <img
                      src={review.bookPhotoUrl}
                      alt={review.occasion}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 text-[#C5A059] mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="font-serif-luxury text-lg sm:text-xl text-[#1F1C18] leading-relaxed mb-6 font-normal">
                    "{review.comment}"
                  </p>
                </div>

                <div className="border-t border-[#E8E2D5]/70 pt-5 flex items-center gap-3.5">
                  <img
                    src={review.avatarUrl}
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#D6CEBE]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-[#1F1C18]">{review.name}</h4>
                    <span className="text-xs text-[#736B60] block font-normal mt-0.5">{review.format} · {review.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-b border-[#E8E2D5]/70 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#8C6D37] uppercase block mb-3">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] font-normal tracking-tight">
              Todo lo que necesitas saber antes de pedir
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#E8E2D5] bg-[#FDFCF9] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif-luxury text-lg sm:text-xl font-medium text-[#1F1C18] hover:text-[#8C6D37] transition-colors cursor-pointer"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#8C6D37] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#8C8275] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-sm sm:text-base text-[#595248] leading-relaxed border-t border-[#E8E2D5]/50 pt-4 font-normal">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

