import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import collectionService from "../services/collectionService";
import CollectionItem from "../components/CollectionItem";
import "./MyCollection.css";

export default function MyCollection() {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollection(currentPage);
  }, [currentPage]);

  const fetchCollection = async (page) => {
    try {
      setLoading(true);
      const response = await collectionService.getCollection(page);
      setCollection(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        per_page: response.per_page,
      });
    } catch (err) {
      setError("Failed to load collection");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async (userBookId, updatedData) => {
    try {
      await collectionService.updateBook(userBookId, updatedData);
      fetchCollection(currentPage);
    } catch (err) {
      alert("Failed to update book");
    }
  };

  const handleRemoveBook = async (userBookId) => {
    if (window.confirm("Remove this book from collection?")) {
      try {
        await collectionService.removeBook(userBookId);
        fetchCollection(currentPage);
      } catch (err) {
        alert("Failed to remove book");
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-collection">
      <h1>My Book Collection</h1>
      <p className="collection-stats">
        {pagination?.total || 0} books in collection
      </p>

      {collection.length === 0 ? (
        <p className="empty-message">
          Your collection is empty. Start adding books!
        </p>
      ) : (
        <>
          <div className="collection-grid">
            {collection.map((userBook) => (
              <CollectionItem
                key={userBook.id}
                userBook={userBook}
                onUpdate={handleUpdateBook}
                onRemove={handleRemoveBook}
              />
            ))}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.last_page }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
