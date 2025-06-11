/**
 * @description Service class for searching users for game invitations
 * @author Austin Barthel
 * @date 2024
 */
public with sharing class TicTacToeUserSearchService {
  /**
   * @description Data transfer object for user search results
   */
  public class UserSearchDTO {
    @AuraEnabled
    public String Id { get; set; }
    @AuraEnabled
    public String Name { get; set; }
    @AuraEnabled
    public String Email { get; set; }
    @AuraEnabled
    public String Title { get; set; }

    public UserSearchDTO(User user) {
      this.Id = user.Id;
      this.Name = user.Name;
      this.Email = user.Email;
      this.Title = user.Title;
    }
  }

  /**
   * @description Searches for users by name or email
   * @param searchTerm The search term to match against user names and emails
   * @return List of UserSearchDTO matching the search criteria
   */
  @AuraEnabled(cacheable=true)
  public static List<UserSearchDTO> searchUsers(String searchTerm) {
    try {
      if (String.isBlank(searchTerm) || searchTerm.length() < 3) {
        return new List<UserSearchDTO>();
      }

      String searchPattern = '%' + String.escapeSingleQuotes(searchTerm) + '%';

      List<User> users = [
        SELECT Id, Name, Email, Title
        FROM User
        WHERE
          IsActive = TRUE
          AND (Name LIKE :searchPattern
          OR Email LIKE :searchPattern)
          AND Id != :UserInfo.getUserId()
        ORDER BY Name
        LIMIT 10
      ];

      List<UserSearchDTO> result = new List<UserSearchDTO>();
      for (User user : users) {
        result.add(new UserSearchDTO(user));
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to search users: ' + e.getMessage()
      );
    }
  }

  /**
   * @description Gets user details by ID
   * @param userId The user ID
   * @return UserSearchDTO with user details
   */
  @AuraEnabled(cacheable=true)
  public static UserSearchDTO getUserById(String userId) {
    try {
      if (String.isBlank(userId)) {
        throw new TicTacToeException('User ID is required');
      }

      List<User> users = [
        SELECT Id, Name, Email, Title
        FROM User
        WHERE Id = :userId AND IsActive = TRUE
        LIMIT 1
      ];

      if (users.isEmpty()) {
        throw new TicTacToeException('User not found');
      }

      return new UserSearchDTO(users[0]);
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to get user details: ' + e.getMessage()
      );
    }
  }
}
