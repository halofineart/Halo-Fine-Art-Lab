import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Quote, Heart } from 'lucide-react';
import { CUSTOMER_REVIEWS, FAQ_ITEMS } from '../data/mockData';

export const ReviewsAndFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-[#FDFCF9]">
      {/* Customer Reviews Section */}
      <section id="reviews" className="py-20 border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
              OPINIONES & TESTIMONIOS REALES
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] mt-2 mb-4 font-normal">
              Historias que ya viven en papel
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-[#595248] font-light">
              Más de 4.500 familias y fotógrafos confían en el taller de HALO Fine Art Lab para encuadernar sus momentos más preciados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CUSTOMER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="rounded-3xl border border-[#D6CEBE] bg-[#F4EFE6]/60 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Photo of their book */}
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 shadow-sm">
                    <img
                      src={review.bookPhotoUrl}
                      alt={review.occasion}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[#C5A059] mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-[#2C2723] italic leading-relaxed mb-6 font-serif-luxury text-base">
                    "{review.comment}"
                  </p>
                </div>

                <div className="border-t border-[#E0D8C8] pt-4 flex items-center gap-3">
                  <img
                    src={review.avatarUrl}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#C5A059]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1C18]">{review.name}</h4>
                    <span className="text-[10px] text-[#8C6D37] block font-medium">{review.format}</span>
                    <span className="text-[10px] text-[#736B60]">{review.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-[#E8E2D5] bg-[#F4EFE6]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] mt-2 mb-3">
              Todo lo que necesitas saber antes de pedir
            </h2>
            <div className="w-12 h-0.5 bg-[#C5A059] mx-auto"></div>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#D6CEBE] bg-[#FDFCF9] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif-luxury text-lg font-bold text-[#1F1C18] hover:text-[#8C6D37] transition-colors"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#8C6D37] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#736B60] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#595248] leading-relaxed border-t border-[#F2ECE1] pt-3">
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
