(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      // Crée un conteneur pour les éléments de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));

      if (options.lightBox) {
        // Crée la lightbox si l'option est activée
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // Attache les écouteurs d'événements
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          // Rendre les images réactives
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          // Déplacer les éléments dans le conteneur de la galerie
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Envelopper chaque élément dans une colonne selon le nombre de colonnes spécifié
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");

          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        // Afficher les tags si l'option est activée
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function(options) {
    // Ouvre la lightbox lorsque l'utilisateur clique sur un élément de la galerie
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Filtrer les images par tag
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    // Naviguer vers l'image précédente dans la lightbox
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    // Naviguer vers l'image suivante dans la lightbox
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      // Crée une ligne pour les éléments de la galerie
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      // Enveloppe les éléments dans des colonnes basées sur le nombre de colonnes spécifié
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      // Déplace l'élément dans le conteneur de la galerie
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      // Ajoute une classe pour rendre l'image réactive
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      // Ouvre la lightbox et affiche l'image cliquée
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    prevImage(lightboxId) {
      // Méthode pour naviguer vers l'image précédente dans la lightbox
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(`#${lightboxId} .lightboxImage`).attr("src")) {
          activeImage = $(this);
        }
      });

      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];

      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let index = -1;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i - 1; // Corrige l'index pour l'image précédente
        }
      });

      if (index < 0) {
        index = imagesCollection.length - 1; // Boucle à la dernière image si on est à la première
      }

      let next = imagesCollection[index];
      $(`#${lightboxId} .lightboxImage`).attr("src", $(next).attr("src"));
    },

    nextImage(lightboxId) {
      // Méthode pour naviguer vers l'image suivante dans la lightbox
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(`#${lightboxId} .lightboxImage`).attr("src")) {
          activeImage = $(this);
        }
      });

      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];

      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let index = -1;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i + 1; // Corrige l'index pour l'image suivante
        }
      });

      if (index >= imagesCollection.length) {
        index = 0; // Boucle à la première image si on est à la dernière
      }

      let next = imagesCollection[index];
      $(`#${lightboxId} .lightboxImage`).attr("src", $(next).attr("src"));
    },

    createLightBox(gallery, lightboxId, navigation) {
      // Crée la structure HTML pour la lightbox
      gallery.append(
        `<div class="modal fade" id="${
          lightboxId ? lightboxId : "galleryLightbox"
        }" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${
                  navigation
                    ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                    : '<span style="display:none;" />'
                }
                <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                ${
                  navigation
                    ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                    : '<span style="display:none;" />'
                }
              </div>
            </div>
          </div>
        </div>`
      );
    },

    showItemTags(gallery, position, tags) {
      // Affiche les tags en haut ou en bas de la galerie
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item">
          <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      // Filtre les éléments de la galerie par tag
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);